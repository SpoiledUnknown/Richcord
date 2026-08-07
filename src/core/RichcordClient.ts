import { EventEmitter } from "events";
import { IPCConnectionError } from "../errors/index.js";
import { IPC, ITransport } from "../rpc/index.js";
import { Activity, ActivityType, ClientEvents, DiscordUser } from "../types/index.js";
import { ILogger } from "../utils/Logger.js";
import { Validation } from "../utils/Validation.js";
import { ConfigResolver, ResolvedRichcordConfig, RichcordClientOptions } from "./Config.js";
import { RPCCommands } from "../utils/Constants.js";
import { ClientState, StateMachine } from "./State.js";

/**
 * Main entrance point and facade for the Richcord RPC Core library.
 * Provides a high-level, event-driven, strongly-typed interface for managing Discord Rich Presence.
 */
export class RichcordClient extends EventEmitter {
  private readonly config: ResolvedRichcordConfig;
  private readonly logger: ILogger;
  private readonly stateMachine: StateMachine;
  private readonly ipc: IPC;
  private currentUser: DiscordUser | null = null;
  private reconnectAttempts: number = 0;
  private isExplicitDisconnect: boolean = false;

  /**
   * Initializes a new instance of the RichcordClient.
   *
   * @param options Configuration options for client initialization.
   * @param customTransport Optional custom ITransport for mocking or alternative socket drivers.
   * @throws ValidationError If options fail schema validation (e.g., invalid Client ID).
   */
  constructor(options: RichcordClientOptions, customTransport?: ITransport) {
    super();
    Validation.validateClientId(options.clientId);

    this.config = ConfigResolver.resolve(options);
    this.logger = this.config.logger;
    this.stateMachine = new StateMachine();
    this.ipc = new IPC(this.logger, customTransport);

    this.bindIPCListeners();
  }

  /**
   * Gets the current lifecycle state of the client.
   */
  public get state(): ClientState {
    return this.stateMachine.state;
  }

  /**
   * Gets details for the currently logged-in Discord user if connected and ready.
   * Returns null if not in READY state.
   */
  public get user(): DiscordUser | null {
    return this.currentUser;
  }

  /**
   * Checks if the client is connected and ready to receive RPC commands.
   */
  public isConnected(): boolean {
    return this.stateMachine.is(ClientState.Ready) && this.ipc.connected;
  }

  /**
   * Connects to the local Discord desktop client and completes the IPC handshake.
   *
   * @returns Details of the authenticated Discord user.
   * @throws IPCConnectionError If network socket connection fails.
   * @throws HandshakeError If initial handshake exchange or READY authorization fails.
   */
  public async connect(): Promise<DiscordUser> {
    if (this.stateMachine.is(ClientState.Ready)) {
      this.logger.debug("connect() called while already in Ready state. Returning current user.");
      return this.currentUser!;
    }

    if (
      this.stateMachine.is(ClientState.Connecting) ||
      this.stateMachine.is(ClientState.Connected) ||
      this.stateMachine.is(ClientState.Handshaking)
    ) {
      throw new IPCConnectionError("Connection process is already in progress.");
    }

    this.isExplicitDisconnect = false;
    this.stateMachine.transitionTo(ClientState.Connecting);

    try {
      this.logger.info("Connecting to local Discord IPC endpoint...");
      await this.ipc.connect();
      this.stateMachine.transitionTo(ClientState.Connected);
      this.emit("connected");

      this.logger.info("Initiating IPC Handshake protocol...");
      this.stateMachine.transitionTo(ClientState.Handshaking);

      const user = await this.ipc.performHandshake(this.config.clientId);
      this.currentUser = user;
      this.reconnectAttempts = 0;

      this.stateMachine.transitionTo(ClientState.Ready);
      this.logger.info(`Richcord client ready. Authenticated as: ${user.username} (${user.id})`);
      this.emit("ready", user);

      return user;
    } catch (error) {
      this.logger.error("Failed to establish ready Richcord client session.", error as Error);
      await this.handleConnectionFailure(error as Error);
      throw error;
    }
  }

  /**
   * Updates the user's Rich Presence activity on Discord.
   *
   * @param activity The activity payload configuration.
   * @throws ClientNotConnectedError If called before client is in Ready state.
   * @throws ValidationError If activity object violates Discord specification constraints.
   * @throws IPCConnectionError If communication with Discord fails.
   */
  public async setActivity(activity: Activity): Promise<void> {
    this.stateMachine.assertReady();
    Validation.validateActivity(activity);

    const formattedActivity = this.formatActivityPayload(activity);

    this.logger.debug(
      "Sending SET_ACTIVITY command payload to Discord.",
      formattedActivity as Record<string, unknown>
    );

    await this.ipc.sendCommand(RPCCommands.SET_ACTIVITY, {
      pid: process.pid,
      activity: formattedActivity,
    });

    this.logger.info("Rich Presence activity updated successfully.");
  }

  /**
   * Clears the current user's Rich Presence activity status on Discord.
   *
   * @throws ClientNotConnectedError If called before client is in Ready state.
   * @throws IPCConnectionError If communication with Discord fails.
   */
  public async clearActivity(): Promise<void> {
    this.stateMachine.assertReady();

    this.logger.debug("Sending SET_ACTIVITY clear payload (null) to Discord.");

    await this.ipc.sendCommand(RPCCommands.SET_ACTIVITY, {
      pid: process.pid,
      activity: null,
    });

    this.logger.info("Rich Presence activity cleared successfully.");
  }

  /**
   * Gracefully terminates the IPC socket connection with Discord.
   */
  public async disconnect(): Promise<void> {
    if (this.stateMachine.is(ClientState.Disconnected)) {
      return;
    }

    this.logger.info("Disconnecting Richcord client...");
    this.isExplicitDisconnect = true;

    if (!this.stateMachine.is(ClientState.Disconnecting)) {
      this.stateMachine.transitionTo(ClientState.Disconnecting);
    }

    try {
      await this.ipc.disconnect();
    } finally {
      this.currentUser = null;
      this.stateMachine.forceReset();
      this.logger.info("Richcord client disconnected gracefully.");
      this.emit("disconnected", "Client requested graceful disconnect.");
    }
  }

  /**
   * Strongly typed event listener registration methods.
   */
  public override on<K extends keyof ClientEvents>(event: K, listener: ClientEvents[K]): this {
    return super.on(event, listener);
  }

  public override once<K extends keyof ClientEvents>(event: K, listener: ClientEvents[K]): this {
    return super.once(event, listener);
  }

  public override off<K extends keyof ClientEvents>(event: K, listener: ClientEvents[K]): this {
    return super.off(event, listener);
  }

  public override emit<K extends keyof ClientEvents>(
    event: K,
    ...args: Parameters<ClientEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  private bindIPCListeners(): void {
    this.ipc.on("error", (err: Error) => {
      this.logger.error("Internal IPC error emitted.", err);
      this.emit("error", err);
    });

    this.ipc.on("close", (reason?: string) => {
      if (this.isExplicitDisconnect) {
        return;
      }

      this.logger.warn(`IPC connection closed unexpectedly: ${reason ?? "Unknown reason"}`);
      this.currentUser = null;
      this.stateMachine.forceReset();
      this.emit("disconnected", reason);

      if (this.config.autoReconnect) {
        this.scheduleAutoReconnect();
      }
    });
  }

  private async handleConnectionFailure(error: Error): Promise<void> {
    this.currentUser = null;
    this.stateMachine.forceReset();
    await this.ipc.disconnect().catch(() => {});
    this.emit("error", error);
  }

  private scheduleAutoReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.logger.error(
        `Exceeded maximum auto-reconnect attempts (${this.config.maxReconnectAttempts}). Ceasing retry.`
      );
      return;
    }

    this.reconnectAttempts++;
    const attempt = this.reconnectAttempts;
    this.logger.info(
      `Scheduling reconnect attempt ${attempt}/${this.config.maxReconnectAttempts} in ${this.config.reconnectIntervalMs}ms.`
    );

    this.emit("reconnecting", attempt);

    setTimeout(() => {
      if (this.stateMachine.is(ClientState.Disconnected) && !this.isExplicitDisconnect) {
        this.connect().catch((err) => {
          this.logger.error(`Auto-reconnect attempt ${attempt} failed.`, err);
        });
      }
    }, this.config.reconnectIntervalMs);
  }

  private formatActivityPayload(activity: Activity): Record<string, unknown> {
    const formatted: Record<string, unknown> = {};

    if (activity.details !== undefined) {
      formatted.details = activity.details;
    }

    if (activity.state !== undefined) {
      formatted.state = activity.state;
    }

    formatted.type = activity.type ?? ActivityType.Playing;

    if (activity.timestamps) {
      const timestampsObj: Record<string, number> = {};

      if (activity.timestamps.start !== undefined) {
        timestampsObj.start =
          activity.timestamps.start instanceof Date
            ? activity.timestamps.start.getTime()
            : activity.timestamps.start;
      }

      if (activity.timestamps.end !== undefined) {
        timestampsObj.end =
          activity.timestamps.end instanceof Date
            ? activity.timestamps.end.getTime()
            : activity.timestamps.end;
      }

      formatted.timestamps = timestampsObj;
    }

    if (activity.assets) {
      const assetsObj: Record<string, string> = {};

      if (activity.assets.largeImage !== undefined) {
        assetsObj.large_image = activity.assets.largeImage;
      }
      if (activity.assets.largeText !== undefined) {
        assetsObj.large_text = activity.assets.largeText;
      }
      if (activity.assets.smallImage !== undefined) {
        assetsObj.small_image = activity.assets.smallImage;
      }
      if (activity.assets.smallText !== undefined) {
        assetsObj.small_text = activity.assets.smallText;
      }

      formatted.assets = assetsObj;
    }

    if (activity.party) {
      const partyObj: Record<string, unknown> = {};

      if (activity.party.id !== undefined) {
        partyObj.id = activity.party.id;
      }
      if (activity.party.size !== undefined) {
        partyObj.size = activity.party.size;
      }

      formatted.party = partyObj;
    }

    if (activity.secrets) {
      const secretsObj: Record<string, string> = {};

      if (activity.secrets.join !== undefined) {
        secretsObj.join = activity.secrets.join;
      }
      if (activity.secrets.spectate !== undefined) {
        secretsObj.spectate = activity.secrets.spectate;
      }
      if (activity.secrets.match !== undefined) {
        secretsObj.match = activity.secrets.match;
      }

      formatted.secrets = secretsObj;
    }

    if (activity.buttons && activity.buttons.length > 0) {
      formatted.buttons = activity.buttons
        .filter((btn): btn is NonNullable<typeof btn> => btn !== undefined)
        .map((btn) => ({
          label: btn.label,
          url: btn.url,
        }));
    }

    if (activity.instance !== undefined) {
      formatted.instance = activity.instance;
    }

    return formatted;
  }
}

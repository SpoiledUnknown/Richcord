import { randomUUID } from "crypto";
import { EventEmitter } from "events";
import { HandshakeError } from "../errors/HandshakeError.js";
import { IPCConnectionError } from "../errors/IPCConnectionError.js";
import { SerializationError } from "../errors/SerializationError.js";
import { DiscordUser } from "../types/Events.js";
import {
  IPCPacket,
  ReadyEventData,
  RPCCommandPayload,
  RPCResponsePayload,
} from "../types/protocols.js";
import { ILogger } from "../utils/Logger.js";
import { Handshake } from "./Handshake.js";
import { Opcode } from "./Opcodes.js";
import { Serializer } from "./Serializer.js";
import { ITransport } from "./transport/ITransport.js";
import { TransportFactory } from "./transport/TransportFactory.js";
import { Defaults } from "../utils/Constants.js";

export interface IPCEvents {
  /** Emitted when Discord IPC completes handshake and sends READY. */
  ready: (user: DiscordUser) => void;
  /** Emitted when the IPC transport is closed. */
  close: (reason?: string) => void;
  /** Emitted when an asynchronous network or protocol error occurs. */
  error: (error: Error) => void;
}

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: Error) => void;
  timer: NodeJS.Timeout;
}

/**
 * High-level IPC connection manager handling socket streaming, framing,
 * handshake procedures, command correlation via nonces, and pings.
 */
export class IPC extends EventEmitter {
  private transport: ITransport | null = null;
  private incomingBuffer: Buffer = Buffer.alloc(0);
  private readonly pendingRequests = new Map<string, PendingRequest>();

  // Tracks which transport instance currently has listeners bound, so
  // repeated connect() calls on the same transport (e.g. after a drop
  // that wasn't routed through disconnect()) never double-bind.
  private listenersBoundFor: ITransport | null = null;

  constructor(
    private readonly logger: ILogger,
    transport?: ITransport
  ) {
    super();
    if (transport) {
      this.transport = transport;
    }
  }

  public get connected(): boolean {
    return this.transport !== null && this.transport.connected;
  }

  /**
   * @throws IPCConnectionError If the network socket connection fails.
   */
  public async connect(): Promise<void> {
    if (!this.transport) {
      this.transport = TransportFactory.createTransport(this.logger);
    }

    const transport = this.transport;

    if (transport.connected) {
      return;
    }

    if (this.listenersBoundFor !== transport) {
      this.bindTransportListeners(transport);
      this.listenersBoundFor = transport;
    }

    await transport.connect();
  }

  /**
   * Performs the Opcode 0 handshake with Discord using the provided Client ID.
   *
   * @throws HandshakeError If handshake fails or times out.
   */
  public async performHandshake(clientId: string): Promise<DiscordUser> {
    const transport = this.transport;
    if (!transport || !transport.connected) {
      throw new HandshakeError("Cannot perform handshake when transport is not connected.");
    }

    return new Promise<DiscordUser>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.off("ready", handleReady);
        this.off("error", handleError);
        reject(
          new HandshakeError("IPC Handshake timed out waiting for READY response from Discord.")
        );
      }, Defaults.CONNECT_TIMEOUT_MS);

      const handleReady = (user: DiscordUser): void => {
        clearTimeout(timeout);
        this.off("error", handleError);
        resolve(user);
      };

      const handleError = (err: Error): void => {
        clearTimeout(timeout);
        this.off("ready", handleReady);
        reject(new HandshakeError("Handshake failed due to transport error.", err));
      };

      this.once("ready", handleReady);
      this.once("error", handleError);

      try {
        const handshakeFrame = Handshake.createFrame(clientId);
        transport.write(handshakeFrame).catch((err) => {
          clearTimeout(timeout);
          this.off("ready", handleReady);
          this.off("error", handleError);
          reject(new HandshakeError("Failed to write handshake frame to transport.", err));
        });
      } catch (err) {
        clearTimeout(timeout);
        this.off("ready", handleReady);
        this.off("error", handleError);

        if (err instanceof HandshakeError) {
          reject(err);
          return;
        }

        reject(new HandshakeError("Failed to create IPC handshake frame.", err));
      }
    });
  }

  /**
   * Sends an RPC command payload over Opcode 1 (FRAME) and awaits Discord's correlated response.
   */
  public async sendCommand<TResponse = unknown>(
    cmd: string,
    args?: Record<string, unknown>,
    evt?: string
  ): Promise<TResponse> {
    const transport = this.transport;
    if (!transport || !transport.connected) {
      throw new IPCConnectionError("Cannot send command when IPC socket is disconnected.");
    }

    const nonce = randomUUID();

    // Constructed as a single literal to satisfy both `readonly` and
    // `exactOptionalPropertyTypes`.
    const payload: RPCCommandPayload = {
      cmd,
      nonce,
      ...(args !== undefined ? { args } : {}),
      ...(evt !== undefined ? { evt } : {}),
    };

    const frame = Serializer.encode(Opcode.FRAME, payload);

    return new Promise<TResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(nonce);
        reject(
          new IPCConnectionError(
            `Command '${cmd}' timed out after ${Defaults.COMMAND_TIMEOUT_MS}ms.`
          )
        );
      }, Defaults.COMMAND_TIMEOUT_MS);

      this.pendingRequests.set(nonce, {
        resolve: resolve as (val: unknown) => void,
        reject,
        timer,
      });

      transport.write(frame).catch((err) => {
        clearTimeout(timer);
        this.pendingRequests.delete(nonce);
        reject(new IPCConnectionError(`Failed to transmit frame for command '${cmd}'.`, err));
      });
    });
  }

  public async disconnect(): Promise<void> {
    this.clearPendingRequests("Connection closed by client.");
    this.incomingBuffer = Buffer.alloc(0);

    if (this.transport) {
      const transportRef = this.transport;
      this.transport = null;
      await transportRef.disconnect();
    }
  }
  private bindTransportListeners(transport: ITransport): void {
    transport.on("data", (chunk: Buffer) => this.handleData(chunk));
    transport.on("error", (err: Error) => this.emit("error", err));
    transport.on("close", (reason?: string) => {
      this.clearPendingRequests(`Transport closed: ${reason ?? "Unknown reason"}`);
      this.emit("close", reason);
    });
  }

  private handleData(chunk: Buffer): void {
    this.incomingBuffer = Buffer.concat([this.incomingBuffer, chunk]);

    while (this.incomingBuffer.length >= Serializer.HEADER_SIZE) {
      let result;
      try {
        result = Serializer.decode(this.incomingBuffer);
      } catch (err) {
        this.logger.error("Failed decoding stream frame.", err as Error);
        this.emit("error", new SerializationError("Stream deserialization failure.", err as Error));
        this.incomingBuffer = Buffer.alloc(0);
        return;
      }

      if (!result) {
        // Incomplete frame, wait for more data chunks.
        break;
      }

      this.incomingBuffer = this.incomingBuffer.subarray(result.bytesRead);
      this.processPacket(result.packet);
    }
  }

  private processPacket(packet: IPCPacket): void {
    switch (packet.opcode) {
      case Opcode.FRAME:
        this.handleFramePacket(packet.payload as RPCResponsePayload);
        break;

      case Opcode.PING:
        this.logger.debug("Received PING from Discord IPC. Sending PONG reply.");
        if (this.transport && this.transport.connected) {
          const pongFrame = Serializer.encode(Opcode.PONG, packet.payload);
          this.transport.write(pongFrame).catch((err) => {
            this.logger.error("Failed sending PONG response.", err as Error);
          });
        }
        break;

      case Opcode.CLOSE: {
        const closePayload = packet.payload as { code?: number; message?: string };
        this.logger.warn(
          `Discord IPC sent CLOSE opcode: ${closePayload.message ?? "No message"} (${closePayload.code ?? "No code"})`
        );
        this.disconnect().catch(() => {});
        break;
      }

      case Opcode.PONG:
        this.logger.debug("Received PONG frame from Discord IPC.");
        break;

      default:
        this.logger.warn(`Received unknown IPC opcode: ${packet.opcode}`);
        break;
    }
  }

  private handleFramePacket(payload: RPCResponsePayload): void {
    if (!payload) {
      return;
    }

    if (payload.cmd === "DISPATCH" && payload.evt === "READY") {
      const readyData = payload.data as unknown as ReadyEventData;
      this.logger.info(`Discord RPC READY event received for user: ${readyData.user.username}`);
      this.emit("ready", readyData.user);
      return;
    }

    if (payload.evt === "ERROR") {
      const errorData = payload.data as unknown as { code?: number; message?: string };
      const errorMsg = errorData.message ?? "Discord RPC command returned an error response.";

      if (payload.nonce && this.pendingRequests.has(payload.nonce)) {
        const req = this.pendingRequests.get(payload.nonce)!;
        clearTimeout(req.timer);
        this.pendingRequests.delete(payload.nonce);
        req.reject(
          new IPCConnectionError(`Discord RPC Error (${errorData.code ?? "UNKNOWN"}): ${errorMsg}`)
        );
      } else {
        this.emit("error", new IPCConnectionError(`Discord RPC Error Dispatch: ${errorMsg}`));
      }
      return;
    }

    if (payload.nonce && this.pendingRequests.has(payload.nonce)) {
      const req = this.pendingRequests.get(payload.nonce)!;
      clearTimeout(req.timer);
      this.pendingRequests.delete(payload.nonce);
      req.resolve(payload.data);
    }
  }

  private clearPendingRequests(reason: string): void {
    for (const [nonce, req] of this.pendingRequests.entries()) {
      clearTimeout(req.timer);
      req.reject(new IPCConnectionError(`Pending request aborted (${nonce}): ${reason}`));
    }
    this.pendingRequests.clear();
  }
}

import { EventEmitter } from "events";
import * as fs from "fs";
import * as net from "net";
import * as path from "path";
import { IPCConnectionError } from "../../errors/IPCConnectionError.js";
import { ILogger } from "../../utils/Logger.js";
import { ITransport } from "./ITransport.js";

/**
 * Unix transport implementation using Discord IPC Unix domain sockets.
 */
export class UnixSocketTransport extends EventEmitter implements ITransport {
  private socket: net.Socket | null = null;

  constructor(private readonly logger: ILogger) {
    super();
  }

  public get connected(): boolean {
    return this.socket !== null && !this.socket.destroyed;
  }

  public async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    const candidateDirs = this.getSearchDirectories();

    for (const baseDir of candidateDirs) {
      for (let i = 0; i < 10; i++) {
        const socketPath = path.join(baseDir, `discord-ipc-${i}`);

        if (!this.isSocketAvailable(socketPath)) {
          continue;
        }

        this.logger.debug(`Attempting Unix domain socket connection: ${socketPath}`);

        try {
          await this.tryConnectSocket(socketPath);
          this.logger.info(`Successfully connected to Unix domain socket: ${socketPath}`);
          return;
        } catch (err) {
          this.logger.debug(`Failed to connect to Unix domain socket: ${socketPath}`, {
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    throw new IPCConnectionError(
      "Could not find or connect to any active Discord IPC socket in the runtime directories."
    );
  }

  public async disconnect(): Promise<void> {
    const socket = this.socket;

    if (!socket) {
      return;
    }

    this.socket = null;

    return new Promise<void>((resolve) => {
      if (socket.destroyed) {
        resolve();
        return;
      }

      socket.removeAllListeners();
      socket.once("close", resolve);
      socket.destroy();
    });
  }

  public async write(data: Buffer): Promise<void> {
    const socket = this.socket;

    if (!socket || socket.destroyed) {
      throw new IPCConnectionError("Cannot write to a closed or unavailable Unix domain socket.");
    }

    return new Promise<void>((resolve, reject) => {
      socket.write(data, (err) => {
        if (err) {
          reject(new IPCConnectionError("Failed writing buffer to Unix domain socket.", err));
          return;
        }

        resolve();
      });
    });
  }

  private getSearchDirectories(): string[] {
    const dirs: string[] = [];
    const env = process.env;

    if (env.XDG_RUNTIME_DIR) {
      dirs.push(env.XDG_RUNTIME_DIR);
      dirs.push(path.join(env.XDG_RUNTIME_DIR, "app", "com.discordapp.Discord"));
      dirs.push(path.join(env.XDG_RUNTIME_DIR, "snap.discord"));
    }

    if (env.TMPDIR) {
      dirs.push(env.TMPDIR);
    }

    if (env.TMP) {
      dirs.push(env.TMP);
    }

    if (env.TEMP) {
      dirs.push(env.TEMP);
    }

    dirs.push("/tmp");
    dirs.push("/tmp/app/com.discordapp.Discord");

    return [...new Set(dirs.filter(Boolean))];
  }

  private isSocketAvailable(socketPath: string): boolean {
    try {
      return fs.statSync(socketPath).isSocket();
    } catch {
      return false;
    }
  }

  private tryConnectSocket(socketPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const socket = net.createConnection({ path: socketPath });

      const cleanup = (): void => {
        socket.removeListener("connect", handleConnect);
        socket.removeListener("error", handleError);
      };

      const handleConnect = (): void => {
        cleanup();

        this.socket = socket;
        this.setupSocketListeners(socket);

        resolve();
      };

      const handleError = (err: Error): void => {
        cleanup();
        socket.destroy();
        reject(err);
      };

      socket.once("connect", handleConnect);
      socket.once("error", handleError);
    });
  }

  private setupSocketListeners(socket: net.Socket): void {
    socket.on("data", (chunk: Buffer) => {
      this.emit("data", chunk);
    });

    socket.on("error", (err: Error) => {
      this.logger.error("Unix domain socket error encountered.", err);

      this.emit("error", new IPCConnectionError("Underlying Unix domain socket error.", err));
    });

    socket.on("close", (hadError: boolean) => {
      this.socket = null;

      const reason = hadError
        ? "Socket closed with transmission error."
        : "Socket closed gracefully.";

      this.logger.info(`Unix domain socket closed: ${reason}`);
      this.emit("close", reason);
    });
  }
}

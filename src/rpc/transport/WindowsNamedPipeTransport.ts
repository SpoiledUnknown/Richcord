import { EventEmitter } from "events";
import * as net from "net";
import { IPCConnectionError } from "../../errors/IPCConnectionError.js";
import { ILogger } from "../../utils/Logger.js";
import { ITransport } from "./ITransport.js";

/**
 * Windows-specific transport implementation using Discord IPC named pipes.
 */
export class WindowsNamedPipeTransport extends EventEmitter implements ITransport {
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

    for (let i = 0; i < 10; i++) {
      const pipePath = `\\\\?\\pipe\\discord-ipc-${i}`;
      this.logger.debug(`Attempting Windows Named Pipe connection: ${pipePath}`);

      try {
        await this.tryConnectPipe(pipePath);
        this.logger.info(`Successfully connected to Windows Named Pipe: ${pipePath}`);
        return;
      } catch (err) {
        this.logger.debug(`Failed to connect to Windows Named Pipe: ${pipePath}`, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    throw new IPCConnectionError(
      "Could not find or connect to any active Discord IPC named pipe (tried discord-ipc-0 through 9)."
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
      throw new IPCConnectionError(
        "Cannot write to a closed or unavailable Windows Named Pipe socket."
      );
    }

    return new Promise<void>((resolve, reject) => {
      socket.write(data, (err) => {
        if (err) {
          reject(
            new IPCConnectionError("Failed writing buffer to Windows Named Pipe socket.", err)
          );
          return;
        }

        resolve();
      });
    });
  }

  private tryConnectPipe(pipePath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const socket = net.createConnection(pipePath);

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
      this.logger.error("Windows Named Pipe socket error encountered.", err);

      this.emit(
        "error",
        new IPCConnectionError("Underlying Windows Named Pipe socket error.", err)
      );
    });

    socket.on("close", (hadError: boolean) => {
      this.socket = null;

      const reason = hadError
        ? "Socket closed with transmission error."
        : "Socket closed gracefully.";

      this.logger.info(`Windows Named Pipe socket closed: ${reason}`);
      this.emit("close", reason);
    });
  }
}

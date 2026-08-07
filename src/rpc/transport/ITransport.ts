import { EventEmitter } from "events";

/**
 * Event map for transport implementations.
 */
export interface ITransportEvents {
  data: (data: Buffer) => void;
  error: (error: Error) => void;
  close: (reason?: string) => void;
}

/**
 * Cross-platform transport used to communicate with Discord's IPC endpoint.
 */
export interface ITransport extends EventEmitter {
  connect(): Promise<void>;

  disconnect(): Promise<void>;

  write(data: Buffer): Promise<void>;

  readonly connected: boolean;

  on<K extends keyof ITransportEvents>(event: K, listener: ITransportEvents[K]): this;

  once<K extends keyof ITransportEvents>(event: K, listener: ITransportEvents[K]): this;

  off<K extends keyof ITransportEvents>(event: K, listener: ITransportEvents[K]): this;

  emit<K extends keyof ITransportEvents>(
    event: K,
    ...args: Parameters<ITransportEvents[K]>
  ): boolean;
}

import { DefaultLogger, ILogger } from "../utils/Logger.js";
import { Defaults } from "../utils/Constants.js";

export interface RichcordClientOptions {
  readonly clientId: string;
  readonly logger?: ILogger;
  readonly debug?: boolean;
  readonly autoReconnect?: boolean;
  readonly maxReconnectAttempts?: number;
  readonly reconnectIntervalMs?: number;
}

export interface ResolvedRichcordConfig {
  readonly clientId: string;
  readonly logger: ILogger;
  readonly autoReconnect: boolean;
  readonly maxReconnectAttempts: number;
  readonly reconnectIntervalMs: number;
}

export class ConfigResolver {
  public static resolve(options: RichcordClientOptions): ResolvedRichcordConfig {
    const logger = options.logger ?? new DefaultLogger(options.debug ?? false);

    return {
      clientId: options.clientId.trim(),
      logger,
      autoReconnect: options.autoReconnect ?? false,
      maxReconnectAttempts: options.maxReconnectAttempts ?? Defaults.MAX_RECONNECT_ATTEMPTS,
      reconnectIntervalMs: options.reconnectIntervalMs ?? Defaults.RECONNECT_INTERVAL_MS,
    };
  }
}

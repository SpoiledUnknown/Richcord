export type LogMetadata = Record<string, unknown>;

/**
 * Logging contract used throughout Richcord.
 */
export interface ILogger {
  debug(message: string, meta?: LogMetadata): void;
  info(message: string, meta?: LogMetadata): void;
  warn(message: string, meta?: LogMetadata): void;
  error(message: string, error?: Error | LogMetadata): void;
}

/**
 * Default console-backed logger.
 */
export class DefaultLogger implements ILogger {
  constructor(private readonly debugEnabled = false) {}

  public debug(message: string, meta?: LogMetadata): void {
    if (!this.debugEnabled) {
      return;
    }

    this.log("DEBUG", console.debug, message, meta);
  }

  public info(message: string, meta?: LogMetadata): void {
    this.log("INFO", console.info, message, meta);
  }

  public warn(message: string, meta?: LogMetadata): void {
    this.log("WARN", console.warn, message, meta);
  }

  public error(message: string, error?: Error | LogMetadata): void {
    this.log("ERROR", console.error, message, error);
  }

  private log(
    level: "DEBUG" | "INFO" | "WARN" | "ERROR",
    writer: (...args: unknown[]) => void,
    message: string,
    data?: unknown
  ): void {
    const prefix = `[${new Date().toISOString()}] [RICHCORD:${level}] ${message}`;

    if (data === undefined) {
      writer(prefix);
      return;
    }

    writer(prefix, data);
  }
}

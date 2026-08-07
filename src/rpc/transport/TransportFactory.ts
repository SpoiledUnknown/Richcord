import { ILogger } from "../../utils/Logger.js";
import { ITransport } from "./ITransport.js";
import { UnixSocketTransport } from "./UnixSocketTransport.js";
import { WindowsNamedPipeTransport } from "./WindowsNamedPipeTransport.js";

export class TransportFactory {
  public static createTransport(logger: ILogger): ITransport {
    if (process.platform === "win32") {
      logger.debug("Using Windows named pipe transport");
      return new WindowsNamedPipeTransport(logger);
    }

    logger.debug("Using Unix domain socket transport");
    return new UnixSocketTransport(logger);
  }
}

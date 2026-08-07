import { RichcordError } from "./RichcordError.js";

export class IPCConnectionError extends RichcordError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

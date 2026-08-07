import { RichcordError } from "./RichcordError.js";

export class HandshakeError extends RichcordError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

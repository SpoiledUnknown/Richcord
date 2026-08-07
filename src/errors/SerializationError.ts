import { RichcordError } from "./RichcordError.js";

export class SerializationError extends RichcordError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
  }
}

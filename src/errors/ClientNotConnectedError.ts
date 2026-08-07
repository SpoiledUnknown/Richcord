import { RichcordError } from "./RichcordError.js";

export class ClientNotConnectedError extends RichcordError {
  constructor(
    message: string = "Richcord client is not connected or ready. Call connect() first."
  ) {
    super(message);
  }
}

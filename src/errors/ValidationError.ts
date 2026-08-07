import { RichcordError } from "./RichcordError.js";

export class ValidationError extends RichcordError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Base abstract class for all custom errors thrown by the Richcord RPC Core library.
 * Preserves stack traces and supports original error causes.
 */
export abstract class RichcordError extends Error {
  /**
   * @param message Description of the error condition.
   * @param cause Optional underlying cause or original exception.
   */
  protected constructor(
    message: string,
    override readonly cause?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

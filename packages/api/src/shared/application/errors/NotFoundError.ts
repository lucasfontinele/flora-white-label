/**
 * Raised by application use cases when a referenced resource does not exist
 * (e.g. a subscription plan id with no matching record). Transport-agnostic.
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

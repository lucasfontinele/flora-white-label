/**
 * Raised by application use cases when an operation violates a uniqueness rule
 * (e.g. an e-mail or document already registered). Transport-agnostic: the
 * presentation layer decides how to surface it.
 */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

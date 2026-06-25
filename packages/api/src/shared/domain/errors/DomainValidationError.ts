import { DomainError } from "./DomainError.js";

/**
 * Raised when a domain invariant or value-object validation rule is violated.
 * Like every {@link DomainError}, it is independent of HTTP.
 */
export class DomainValidationError extends DomainError {
  public constructor(message: string) {
    super(message);
  }
}

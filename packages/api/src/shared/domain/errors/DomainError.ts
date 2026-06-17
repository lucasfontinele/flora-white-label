/**
 * Base class for every error raised by the domain layer.
 *
 * Domain errors are transport-agnostic: they carry no HTTP status code and know
 * nothing about how they will be presented. The presentation layer is
 * responsible for translating them into protocol-specific responses.
 */
export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

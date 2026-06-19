/**
 * Raised by application use cases when authentication fails. The message must
 * remain generic so callers cannot infer whether an account exists.
 */
export class AuthenticationError extends Error {
  constructor(message = "Invalid credentials.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

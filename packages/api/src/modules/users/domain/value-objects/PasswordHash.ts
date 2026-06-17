import { ValueObject } from "../../../../shared/domain/value-objects/ValueObject.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

interface PasswordHashProps {
  value: string;
}

/**
 * Represents an already-hashed password. It deliberately has no factory that
 * accepts plaintext — hashing is performed in the application layer through the
 * `HashService` port, and the resulting digest is wrapped here.
 */
export class PasswordHash extends ValueObject<PasswordHashProps> {
  private constructor(props: PasswordHashProps) {
    super(props);
  }

  static fromHash(hash: string): PasswordHash {
    if ((hash ?? "").trim().length === 0) {
      throw new DomainValidationError("Password hash cannot be empty.");
    }

    return new PasswordHash({ value: hash });
  }

  get value(): string {
    return this.props.value;
  }
}

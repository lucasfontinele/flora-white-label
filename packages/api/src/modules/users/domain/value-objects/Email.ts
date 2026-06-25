import { ValueObject } from "../../../../shared/domain/value-objects/ValueObject.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

interface EmailProps {
  value: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * E-mail address value object. Normalized to lowercase, validated for format,
 * and compared by value.
 */
export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  static create(value: string): Email {
    const normalized = (value ?? "").trim().toLowerCase();

    if (normalized.length === 0) {
      throw new DomainValidationError("Email is required.");
    }

    if (!EMAIL_REGEX.test(normalized)) {
      throw new DomainValidationError(`Invalid email: "${value}".`);
    }

    return new Email({ value: normalized });
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}

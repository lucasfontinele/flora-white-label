import { ValueObject } from "../../../../shared/domain/value-objects/ValueObject.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

interface CnaeProps {
  value: string;
}

/**
 * CNAE value object (economic activity code). Accepts masked or unmasked input
 * (e.g. "8630-5/03" or "8630503"), stores exactly 7 digits. Only structural
 * format is validated here — not the existence in the official CNAE table.
 */
export class Cnae extends ValueObject<CnaeProps> {
  private constructor(props: CnaeProps) {
    super(props);
  }

  static create(value: string): Cnae {
    const digits = (value ?? "").replace(/\D/g, "");

    if (digits.length === 0) {
      throw new DomainValidationError("CNAE is required.");
    }

    if (digits.length !== 7) {
      throw new DomainValidationError(`CNAE must have exactly 7 digits: "${value}".`);
    }

    return new Cnae({ value: digits });
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}

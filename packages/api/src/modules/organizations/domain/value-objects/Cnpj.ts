import { ValueObject } from "../../../../shared/domain/value-objects/ValueObject.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

interface CnpjProps {
  value: string;
}

/**
 * Validates a CNPJ using the official check-digit algorithm. Expects a
 * digits-only string of length 14; sequences of repeated digits are rejected.
 */
function isValidCnpj(digits: string): boolean {
  if (!/^\d{14}$/.test(digits)) {
    return false;
  }

  if (/^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  const checkDigit = (length: number): number => {
    // Weights cycle 2..9 applied right-to-left over the first `length` digits.
    let sum = 0;
    let weight = 2;
    for (let index = length - 1; index >= 0; index -= 1) {
      sum += Number(digits[index]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return checkDigit(12) === Number(digits[12]) && checkDigit(13) === Number(digits[13]);
}

/**
 * CNPJ value object. Stored as 14 digits (mask removed), validated against the
 * official check-digit algorithm. Equality is by value.
 */
export class Cnpj extends ValueObject<CnpjProps> {
  private constructor(props: CnpjProps) {
    super(props);
  }

  static create(value: string): Cnpj {
    const digits = (value ?? "").replace(/\D/g, "");

    if (digits.length === 0) {
      throw new DomainValidationError("CNPJ is required.");
    }

    if (!isValidCnpj(digits)) {
      throw new DomainValidationError(`Invalid CNPJ: "${value}".`);
    }

    return new Cnpj({ value: digits });
  }

  get value(): string {
    return this.props.value;
  }

  toString(): string {
    return this.props.value;
  }
}

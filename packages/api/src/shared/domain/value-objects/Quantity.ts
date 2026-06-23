import { ValueObject } from "./ValueObject.js";
import { DomainValidationError } from "../errors/DomainValidationError.js";

interface QuantityProps {
  value: number;
}

/**
 * Stock quantity expressed strictly as a nonnegative integer. Floats and
 * negative values are rejected so inventory counts never lose precision or go
 * below zero. Mirrors {@link MoneyInCents} precision philosophy.
 */
export class Quantity extends ValueObject<QuantityProps> {
  private constructor(props: QuantityProps) {
    super(props);
  }

  static create(value: number): Quantity {
    if (!Number.isInteger(value)) {
      throw new DomainValidationError("Quantity must be an integer.");
    }

    if (value < 0) {
      throw new DomainValidationError("Quantity cannot be negative.");
    }

    return new Quantity({ value });
  }

  get value(): number {
    return this.props.value;
  }
}

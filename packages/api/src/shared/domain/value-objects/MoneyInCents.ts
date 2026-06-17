import { ValueObject } from "./ValueObject.js";
import { DomainValidationError } from "../errors/DomainValidationError.js";

interface MoneyInCentsProps {
  value: number;
}

/**
 * Monetary amount expressed strictly as an integer number of cents. Floats and
 * negative values are rejected so money never loses precision.
 */
export class MoneyInCents extends ValueObject<MoneyInCentsProps> {
  private constructor(props: MoneyInCentsProps) {
    super(props);
  }

  static create(value: number): MoneyInCents {
    if (!Number.isInteger(value)) {
      throw new DomainValidationError("Money must be an integer number of cents.");
    }

    if (value < 0) {
      throw new DomainValidationError("Money cannot be negative.");
    }

    return new MoneyInCents({ value });
  }

  get value(): number {
    return this.props.value;
  }
}

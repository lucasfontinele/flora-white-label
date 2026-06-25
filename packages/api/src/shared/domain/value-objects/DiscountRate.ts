import { ValueObject } from "./ValueObject.js";
import { DomainValidationError } from "../errors/DomainValidationError.js";

interface DiscountRateProps {
  value: number;
}

export const MIN_DISCOUNT_RATE = 0.01;
export const MAX_DISCOUNT_RATE = 1;

/**
 * Discount expressed as a percentage in the inclusive range [0.01, 1] (i.e.
 * 1% to 100%). Values outside the range, NaN, and non-numbers are rejected so a
 * discount can never silently become invalid. Mirrors the precision philosophy
 * of {@link MoneyInCents}; absence of a discount is represented by `null` at the
 * call site, not by this value object.
 */
export class DiscountRate extends ValueObject<DiscountRateProps> {
  private constructor(props: DiscountRateProps) {
    super(props);
  }

  static create(value: number): DiscountRate {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new DomainValidationError("Discount must be a number.");
    }

    if (value < MIN_DISCOUNT_RATE || value > MAX_DISCOUNT_RATE) {
      throw new DomainValidationError("Discount must be between 0.01 and 1.");
    }

    return new DiscountRate({ value });
  }

  get value(): number {
    return this.props.value;
  }
}

import { describe, expect, it } from "vitest";
import { DiscountRate } from "./DiscountRate.js";
import { DomainValidationError } from "../errors/DomainValidationError.js";

describe("DiscountRate", () => {
  it("accepts the boundary values 0.01 and 1", () => {
    expect(DiscountRate.create(0.01).value).toBe(0.01);
    expect(DiscountRate.create(1).value).toBe(1);
  });

  it("accepts a mid-range value", () => {
    expect(DiscountRate.create(0.1).value).toBe(0.1);
  });

  it("rejects values below 0.01", () => {
    expect(() => DiscountRate.create(0)).toThrow(DomainValidationError);
    expect(() => DiscountRate.create(0.009)).toThrow(DomainValidationError);
  });

  it("rejects values above 1", () => {
    expect(() => DiscountRate.create(1.01)).toThrow(DomainValidationError);
    expect(() => DiscountRate.create(2)).toThrow(DomainValidationError);
  });

  it("rejects negative and NaN values", () => {
    expect(() => DiscountRate.create(-0.5)).toThrow(DomainValidationError);
    expect(() => DiscountRate.create(Number.NaN)).toThrow(DomainValidationError);
  });
});

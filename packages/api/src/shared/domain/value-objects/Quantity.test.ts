import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../errors/DomainValidationError.js";
import { Quantity } from "./Quantity.js";

describe("Quantity", () => {
  it("creates a quantity for zero and positive integers", () => {
    expect(Quantity.create(0).value).toBe(0);
    expect(Quantity.create(150).value).toBe(150);
  });

  it("rejects negative values", () => {
    expect(() => Quantity.create(-1)).toThrow(DomainValidationError);
  });

  it("rejects non-integer values", () => {
    expect(() => Quantity.create(3.5)).toThrow(DomainValidationError);
    expect(() => Quantity.create(Number.NaN)).toThrow(DomainValidationError);
  });

  it("compares by structural equality", () => {
    expect(Quantity.create(10).equals(Quantity.create(10))).toBe(true);
    expect(Quantity.create(10).equals(Quantity.create(11))).toBe(false);
  });
});

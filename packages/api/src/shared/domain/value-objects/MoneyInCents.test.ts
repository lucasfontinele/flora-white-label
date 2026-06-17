import { describe, expect, it } from "vitest";
import { MoneyInCents } from "./MoneyInCents.js";
import { DomainValidationError } from "../errors/DomainValidationError.js";

describe("MoneyInCents", () => {
  it("accepts zero and positive integers", () => {
    expect(MoneyInCents.create(0).value).toBe(0);
    expect(MoneyInCents.create(15000).value).toBe(15000);
  });

  it("rejects negative values", () => {
    expect(() => MoneyInCents.create(-1)).toThrow(DomainValidationError);
  });

  it("rejects non-integer (float) values", () => {
    expect(() => MoneyInCents.create(10.5)).toThrow(DomainValidationError);
  });
});

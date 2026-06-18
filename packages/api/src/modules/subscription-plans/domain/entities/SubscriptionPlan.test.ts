import { describe, expect, it } from "vitest";
import { SubscriptionPlan } from "./SubscriptionPlan.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

const baseProps = {
  title: "Plano Essencial",
  description: "Ideal para associações iniciantes.",
  price: MoneyInCents.create(15000),
  operatorsLimit: 5,
  patientsLimit: 100,
};

describe("SubscriptionPlan", () => {
  it("creates a valid plan exposing title and description", () => {
    const plan = SubscriptionPlan.create(baseProps);

    expect(plan.title).toBe("Plano Essencial");
    expect(plan.description).toBe("Ideal para associações iniciantes.");
    expect(plan.priceInCents).toBe(15000);
  });

  it("rejects an empty title", () => {
    expect(() => SubscriptionPlan.create({ ...baseProps, title: "  " })).toThrow(
      DomainValidationError,
    );
  });

  it("rejects an empty description", () => {
    expect(() => SubscriptionPlan.create({ ...baseProps, description: "" })).toThrow(
      DomainValidationError,
    );
  });

  it("still rejects non-positive limits", () => {
    expect(() => SubscriptionPlan.create({ ...baseProps, operatorsLimit: 0 })).toThrow(
      DomainValidationError,
    );
  });
});

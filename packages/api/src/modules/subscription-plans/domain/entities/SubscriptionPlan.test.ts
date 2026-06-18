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
  it("creates a valid plan exposing trimmed title and description", () => {
    const plan = SubscriptionPlan.create({
      ...baseProps,
      title: "  Plano Essencial  ",
      description: "  Ideal para associações iniciantes.  ",
    });

    expect(plan.title).toBe("Plano Essencial");
    expect(plan.description).toBe("Ideal para associações iniciantes.");
    expect(plan.priceInCents).toBe(15000);
  });

  it("allows omitted description", () => {
    const plan = SubscriptionPlan.create({
      title: baseProps.title,
      price: baseProps.price,
      operatorsLimit: baseProps.operatorsLimit,
      patientsLimit: baseProps.patientsLimit,
    });

    expect(plan.description).toBeUndefined();
  });

  it("rejects an empty title", () => {
    expect(() => SubscriptionPlan.create({ ...baseProps, title: "  " })).toThrow(
      DomainValidationError,
    );
  });

  it("rejects a blank sent description", () => {
    expect(() => SubscriptionPlan.create({ ...baseProps, description: "  " })).toThrow(
      DomainValidationError,
    );
  });

  it("rejects non-positive operator limits", () => {
    expect(() => SubscriptionPlan.create({ ...baseProps, operatorsLimit: 0 })).toThrow(
      DomainValidationError,
    );
  });

  it("rejects non-positive patient limits", () => {
    expect(() => SubscriptionPlan.create({ ...baseProps, patientsLimit: -1 })).toThrow(
      DomainValidationError,
    );
  });

  it("rejects non-integer limits", () => {
    expect(() => SubscriptionPlan.create({ ...baseProps, operatorsLimit: 1.5 })).toThrow(
      DomainValidationError,
    );
    expect(() => SubscriptionPlan.create({ ...baseProps, patientsLimit: 1.5 })).toThrow(
      DomainValidationError,
    );
  });
});

import { describe, expect, it } from "vitest";
import {
  createSubscriptionPlanBodySchema,
  subscriptionPlanParamsSchema,
  updateSubscriptionPlanBodySchema,
} from "./subscription-plan-schemas.js";

const validBody = {
  title: "Plano Essencial",
  description: "Ideal para associacoes iniciantes.",
  priceInCents: 15000,
  operatorsLimit: 5,
  patientsLimit: 100,
};

describe("subscription plan schemas", () => {
  it("accepts create body with integer cents and optional or null description", () => {
    expect(createSubscriptionPlanBodySchema.safeParse(validBody).success).toBe(true);
    expect(
      createSubscriptionPlanBodySchema.safeParse({
        title: "Plano Essencial",
        priceInCents: 15000,
        operatorsLimit: 5,
        patientsLimit: 100,
      }).success,
    ).toBe(true);
    expect(
      createSubscriptionPlanBodySchema.safeParse({
        ...validBody,
        description: null,
      }).success,
    ).toBe(true);
  });

  it("trims title and description for write bodies", () => {
    const result = createSubscriptionPlanBodySchema.safeParse({
      ...validBody,
      title: "  Plano Essencial  ",
      description: "  Ideal para associacoes iniciantes.  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Plano Essencial");
      expect(result.data.description).toBe("Ideal para associacoes iniciantes.");
    }
  });

  it("rejects invalid create body values", () => {
    expect(createSubscriptionPlanBodySchema.safeParse({ ...validBody, title: " " }).success).toBe(
      false,
    );
    expect(
      createSubscriptionPlanBodySchema.safeParse({ ...validBody, description: " " }).success,
    ).toBe(false);
    expect(
      createSubscriptionPlanBodySchema.safeParse({ ...validBody, priceInCents: 10.5 }).success,
    ).toBe(false);
    expect(
      createSubscriptionPlanBodySchema.safeParse({ ...validBody, priceInCents: -1 }).success,
    ).toBe(false);
    expect(
      createSubscriptionPlanBodySchema.safeParse({ ...validBody, operatorsLimit: 0 }).success,
    ).toBe(false);
    expect(
      createSubscriptionPlanBodySchema.safeParse({ ...validBody, patientsLimit: 0 }).success,
    ).toBe(false);
    expect(
      createSubscriptionPlanBodySchema.safeParse({ ...validBody, extra: "field" }).success,
    ).toBe(false);
  });

  it("accepts an optional unlimitedOperators boolean and rejects non-boolean values", () => {
    expect(
      createSubscriptionPlanBodySchema.safeParse({ ...validBody, unlimitedOperators: true }).success,
    ).toBe(true);
    expect(
      createSubscriptionPlanBodySchema.safeParse({ ...validBody, unlimitedOperators: "yes" }).success,
    ).toBe(false);
  });

  it("accepts operatorsLimit 0 only when unlimitedOperators is true", () => {
    expect(
      createSubscriptionPlanBodySchema.safeParse({
        ...validBody,
        operatorsLimit: 0,
        unlimitedOperators: true,
      }).success,
    ).toBe(true);
    expect(
      createSubscriptionPlanBodySchema.safeParse({ ...validBody, operatorsLimit: 0 }).success,
    ).toBe(false);
  });

  it("accepts nonblank params IDs and rejects blank IDs", () => {
    expect(subscriptionPlanParamsSchema.safeParse({ id: "plan-1" }).success).toBe(true);
    expect(subscriptionPlanParamsSchema.safeParse({ id: " " }).success).toBe(false);
  });

  it("requires a full update body and rejects partial updates", () => {
    expect(updateSubscriptionPlanBodySchema.safeParse(validBody).success).toBe(true);
    expect(
      updateSubscriptionPlanBodySchema.safeParse({
        title: "Plano Profissional",
        priceInCents: 29900,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid update body values", () => {
    expect(updateSubscriptionPlanBodySchema.safeParse({ ...validBody, title: " " }).success).toBe(
      false,
    );
    expect(
      updateSubscriptionPlanBodySchema.safeParse({ ...validBody, priceInCents: 10.5 }).success,
    ).toBe(false);
    expect(
      updateSubscriptionPlanBodySchema.safeParse({ ...validBody, operatorsLimit: -1 }).success,
    ).toBe(false);
    expect(
      updateSubscriptionPlanBodySchema.safeParse({ ...validBody, extra: "field" }).success,
    ).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { createSubscriptionPlan } from "./create-subscription-plan";
import type { SubscriptionPlanPayload } from "../schemas/subscription-plan-schema";

const payload: SubscriptionPlanPayload = {
  title: "Plano Essencial",
  description: "Ideal para associações iniciantes.",
  priceInCents: 15000,
  patientsLimit: 100,
  unlimitedOperators: false,
  operatorsLimit: 5,
};

const created = {
  id: "plan-1",
  ...payload,
  createdAt: "2026-06-18T14:53:07.929Z",
  updatedAt: "2026-06-18T14:53:07.929Z",
};

describe("createSubscriptionPlan", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("POSTs the plan payload to the backoffice endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(created), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createSubscriptionPlan(payload)).resolves.toEqual(created);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/backoffice/subscription-plans",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { updateSubscriptionPlan } from "./update-subscription-plan";
import type { SubscriptionPlanPayload } from "../schemas/subscription-plan-schema";

const payload: SubscriptionPlanPayload = {
  title: "Plano Profissional",
  description: null,
  priceInCents: 29900,
  patientsLimit: 300,
  unlimitedOperators: true,
  operatorsLimit: 0,
};

const updated = {
  id: "plan-1",
  ...payload,
  createdAt: "2026-06-18T14:53:07.929Z",
  updatedAt: "2026-06-18T15:00:00.000Z",
};

describe("updateSubscriptionPlan", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("PUTs the plan payload to the backoffice endpoint with its id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(updated), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(updateSubscriptionPlan("plan-1", payload)).resolves.toEqual(updated);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/backoffice/subscription-plans/plan-1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    );
  });
});

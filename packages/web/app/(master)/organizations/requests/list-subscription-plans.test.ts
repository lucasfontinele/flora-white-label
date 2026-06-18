import { afterEach, describe, expect, it, vi } from "vitest";
import { listSubscriptionPlans } from "./list-subscription-plans";

const response = {
  data: [
    {
      id: "plan_starter",
      title: "Starter",
      description: "Plano inicial",
      priceInCents: 59700,
      operatorsLimit: 10,
      patientsLimit: 50,
      unlimitedOperators: false,
      createdAt: "2026-06-16T00:00:00.000Z",
      updatedAt: "2026-06-16T00:00:00.000Z",
    },
  ],
};

describe("listSubscriptionPlans", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests available subscription plans from the backoffice endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listSubscriptionPlans()).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/backoffice/subscription-plans",
      expect.objectContaining({
        headers: expect.any(Headers),
        method: "GET",
      }),
    );
  });
});

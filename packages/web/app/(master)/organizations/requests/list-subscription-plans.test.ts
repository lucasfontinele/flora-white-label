import { afterEach, describe, expect, it, vi } from "vitest";
import { listSubscriptionPlans } from "./list-subscription-plans";

const response = {
  data: [
    {
      code: "starter",
      id: "plan_starter",
      maxActiveUsers: 50,
      maxOperators: 10,
      name: "Starter",
      operatorLimitType: "limited",
      priceInCents: 59700,
    },
  ],
};

describe("listSubscriptionPlans", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests available subscription plans with temporary Master headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(listSubscriptionPlans()).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/subscription-plans",
      expect.objectContaining({
        headers: expect.any(Headers),
        method: "GET",
      }),
    );
  });
});

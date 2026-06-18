import { afterEach, describe, expect, it, vi } from "vitest";
import { listSubscriptionPlans } from "./list-subscription-plans";

const response = {
  data: [
    {
      id: "88e1e97c-7ee2-4d8b-8bd5-57decd607302",
      title: "Starter",
      description: "Plano focado para pequenas associações que desejam evoluir seu processo operacional.",
      priceInCents: 59700,
      operatorsLimit: 5,
      patientsLimit: 30,
      createdAt: "2026-06-18T14:53:07.929Z",
      updatedAt: "2026-06-18T14:53:07.929Z",
    },
  ],
};

describe("listSubscriptionPlans", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests backoffice subscription plans with temporary Master headers", async () => {
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

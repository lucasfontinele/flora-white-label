import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteSubscriptionPlan } from "./delete-subscription-plan";

describe("deleteSubscriptionPlan", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("DELETEs the plan by id and resolves with no content", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(deleteSubscriptionPlan("plan-1")).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/backoffice/subscription-plans/plan-1",
      expect.objectContaining({
        method: "DELETE",
      }),
    );
  });
});

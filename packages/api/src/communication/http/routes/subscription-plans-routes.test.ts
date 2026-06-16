import { describe, expect, it } from "vitest";
import type { SubscriptionPlanDto } from "@flora/shared/organizations";
import type { OrganizationRepository } from "../../../application/organizations/organization-repository.js";
import type { SubscriptionPlanRepository } from "../../../application/subscription-plans/subscription-plan-repository.js";
import { buildServer } from "../build-server.js";

const plan: SubscriptionPlanDto = {
  code: "starter" as const,
  id: "plan_starter",
  maxActiveUsers: 50,
  maxOperators: 10,
  name: "Starter",
  operatorLimitType: "limited" as const,
  priceInCents: 59700,
};

function buildRepositories() {
  const organizationRepository: OrganizationRepository = {
    async create() {
      throw new Error("not used");
    },
    async existsByCnpj() {
      return false;
    },
    async list(input) {
      return {
        data: [],
        pagination: {
          page: input.page,
          perPage: input.perPage,
          total: 0,
          totalPages: 0,
        },
      };
    },
  };

  const subscriptionPlanRepository: SubscriptionPlanRepository = {
    async findById() {
      return plan;
    },
    async list() {
      return [plan];
    },
  };

  return { organizationRepository, subscriptionPlanRepository };
}

describe("subscription plans routes", () => {
  it("lists subscription plans for an authenticated Master", async () => {
    const app = await buildServer(buildRepositories());

    const response = await app.inject({
      headers: {
        "x-master-role": "master",
        "x-master-user-id": "master_1",
      },
      method: "GET",
      url: "/subscription-plans",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: [plan] });
  });

  it("rejects missing Master authentication", async () => {
    const app = await buildServer(buildRepositories());

    const response = await app.inject({
      method: "GET",
      url: "/subscription-plans",
    });

    expect(response.statusCode).toBe(401);
  });

  it("rejects non-Master users", async () => {
    const app = await buildServer(buildRepositories());

    const response = await app.inject({
      headers: {
        "x-master-role": "operator",
        "x-master-user-id": "user_1",
      },
      method: "GET",
      url: "/subscription-plans",
    });

    expect(response.statusCode).toBe(403);
  });
});

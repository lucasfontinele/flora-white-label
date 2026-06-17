import { describe, expect, it, vi } from "vitest";
import type { SubscriptionPlanDto } from "@flora/shared/organizations";
import type { AuthenticationRepository, TokenService } from "../../../application/authentication/authentication-repository.js";
import type { OrganizationRepository } from "../../../application/organizations/organization-repository.js";
import type { SubscriptionPlanRepository } from "../../../application/subscription-plans/subscription-plan-repository.js";
import { buildServer } from "../build-server.js";

const plan: SubscriptionPlanDto = {
  code: "starter",
  id: "plan_starter",
  maxActiveUsers: 50,
  maxOperators: 10,
  name: "Starter",
  operatorLimitType: "limited",
  priceInCents: 59700,
};

describe("authentication marker regression", () => {
  it("does not invoke the new auth context for existing organization or plan endpoints", async () => {
    const authenticationRepository = buildAuthenticationRepository();
    const tokens = tokenService();
    const app = await buildServer({
      authenticationRepository,
      organizationRepository: organizationRepository(),
      subscriptionPlanRepository: subscriptionPlanRepository(),
      tokenService: tokens,
    });

    const headers = {
      "x-master-role": "master",
      "x-master-user-id": "master_1",
    };
    const plans = await app.inject({ headers, method: "GET", url: "/subscription-plans" });
    const organizations = await app.inject({ headers, method: "GET", url: "/organizations" });

    expect(plans.statusCode).toBe(200);
    expect(organizations.statusCode).toBe(200);
    expect(tokens.verifyAccessToken).not.toHaveBeenCalled();
    expect(authenticationRepository.findSessionWithUser).not.toHaveBeenCalled();
  });
});

function buildAuthenticationRepository(): AuthenticationRepository {
  return {
    createRefreshToken: vi.fn(),
    createSession: vi.fn(),
    extendSession: vi.fn(),
    findRefreshTokenByHash: vi.fn(),
    findSessionWithUser: vi.fn(),
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
    recordAuditEvent: vi.fn(),
    revokeRefreshTokensForSession: vi.fn(),
    revokeSession: vi.fn(),
    rotateRefreshToken: vi.fn(),
    updateRefreshTokenStatus: vi.fn(),
    updateSessionStatus: vi.fn(),
    updateUserLastLogin: vi.fn(),
  };
}

function tokenService(): TokenService {
  return {
    signAccessToken: vi.fn(),
    signRefreshToken: vi.fn(),
    verifyAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
  };
}

function organizationRepository(): OrganizationRepository {
  return {
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
}

function subscriptionPlanRepository(): SubscriptionPlanRepository {
  return {
    async findById() {
      return plan;
    },
    async list() {
      return [plan];
    },
  };
}

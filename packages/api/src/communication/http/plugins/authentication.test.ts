import Fastify from "fastify";
import { describe, expect, it, vi } from "vitest";
import type { AuthenticationRepository, TokenService } from "../../../application/authentication/authentication-repository.js";
import type { AuthenticationUser } from "../../../domain/authentication/user.js";
import type { UserSession } from "../../../domain/authentication/user-session.js";
import { registerErrorHandler } from "./error-handler.js";
import { authenticationPlugin } from "./authentication.js";

const user: AuthenticationUser = {
  email: "organizacao@flora.local",
  id: "user_org",
  isActive: true,
  organizationId: "org_1",
  organizationIsActive: true,
  passwordHash: "hash",
  type: "ORGANIZATION",
};

const session: UserSession = {
  expiresAt: new Date("2026-07-17T00:00:00.000Z"),
  id: "session_1",
  lastUsedAt: new Date("2026-06-17T00:00:00.000Z"),
  organizationId: "org_1",
  revokedAt: null,
  revokedReason: null,
  status: "ACTIVE",
  userId: "user_org",
};

describe("authentication plugin", () => {
  it("parses bearer tokens and stores auth context on the request", async () => {
    const app = await buildApp(buildRepository({ session, user }), tokenService());

    const response = await app.inject({
      headers: { authorization: "Bearer access_token" },
      method: "GET",
      url: "/context",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: {
        session: {
          expiresAt: "2026-07-17T00:00:00.000Z",
          id: "session_1",
          organizationId: "org_1",
          userId: "user_org",
        },
        user: {
          email: "organizacao@flora.local",
          id: "user_org",
          organizationId: "org_1",
          type: "ORGANIZATION",
        },
      },
    });
  });

  it("rejects malformed bearer values and tenant-claim mismatches", async () => {
    const malformedApp = await buildApp(buildRepository({ session, user }), tokenService());
    const mismatchApp = await buildApp(buildRepository({ session, user: { ...user, organizationId: "org_2" } }), tokenService());

    expect(
      (await malformedApp.inject({ headers: { authorization: "Token access_token" }, method: "GET", url: "/context" }))
        .statusCode,
    ).toBe(401);
    expect(
      (await mismatchApp.inject({ headers: { authorization: "Bearer access_token" }, method: "GET", url: "/context" }))
        .statusCode,
    ).toBe(401);
  });
});

async function buildApp(repository: AuthenticationRepository, tokens: TokenService) {
  const app = Fastify({ logger: false });
  registerErrorHandler(app);
  await authenticationPlugin(app, {
    authenticationRepository: repository,
    tokenService: tokens,
  });
  app.get("/context", async (request) => ({
    data: await request.requireAuthentication(),
  }));

  return app;
}

function buildRepository(result: { session: UserSession; user: AuthenticationUser } | null): AuthenticationRepository {
  return {
    createRefreshToken: vi.fn(),
    createSession: vi.fn(),
    extendSession: vi.fn(),
    findRefreshTokenByHash: vi.fn(),
    findSessionWithUser: vi.fn(async () => result),
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
    verifyAccessToken: vi.fn(async () => ({
      organizationId: "org_1",
      sessionId: "session_1",
      tokenId: "access_jti",
      type: "ORGANIZATION" as const,
      userId: "user_org",
    })),
    verifyRefreshToken: vi.fn(),
  };
}

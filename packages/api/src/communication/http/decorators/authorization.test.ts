import Fastify from "fastify";
import { describe, expect, it, vi } from "vitest";
import type { AuthenticationRepository, TokenService } from "../../../application/authentication/authentication-repository.js";
import type { AuthenticationUser } from "../../../domain/authentication/user.js";
import type { UserSession } from "../../../domain/authentication/user-session.js";
import { registerErrorHandler } from "../plugins/error-handler.js";
import { authenticationPlugin } from "../plugins/authentication.js";
import { Authorization } from "./authorization.js";

const masterUser: AuthenticationUser = {
  email: "master@flora.local",
  id: "user_master",
  isActive: true,
  organizationId: null,
  organizationIsActive: null,
  passwordHash: "hash",
  type: "MASTER",
};

const activeSession: UserSession = {
  expiresAt: new Date("2026-07-17T00:00:00.000Z"),
  id: "session_1",
  lastUsedAt: new Date("2026-06-17T00:00:00.000Z"),
  organizationId: null,
  revokedAt: null,
  revokedReason: null,
  status: "ACTIVE",
  userId: "user_master",
};

describe("Authorization marker", () => {
  it("protects isolated routes and exposes authenticated context", async () => {
    const app = await buildProtectedApp({
      repository: buildRepository({ session: activeSession, user: masterUser }),
      tokenService: tokenService(),
    });

    const response = await app.inject({
      headers: { authorization: "Bearer access_token" },
      method: "GET",
      url: "/protected",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: {
        sessionId: "session_1",
        userId: "user_master",
        userType: "MASTER",
      },
    });
  });

  it("rejects missing, revoked, and forbidden sessions on isolated routes", async () => {
    const missingBearerApp = await buildProtectedApp({
      repository: buildRepository({ session: activeSession, user: masterUser }),
      tokenService: tokenService(),
    });
    const revokedApp = await buildProtectedApp({
      repository: buildRepository({ session: { ...activeSession, status: "REVOKED" }, user: masterUser }),
      tokenService: tokenService(),
    });
    const forbiddenApp = await buildProtectedApp({
      repository: buildRepository({
        session: { ...activeSession, organizationId: "org_1" },
        user: { ...masterUser, organizationId: "org_1", organizationIsActive: true, type: "STANDARD" },
      }),
      tokenService: tokenService({ organizationId: "org_1", type: "STANDARD" }),
    });

    expect((await missingBearerApp.inject({ method: "GET", url: "/protected" })).statusCode).toBe(401);
    expect(
      (await revokedApp.inject({ headers: { authorization: "Bearer access_token" }, method: "GET", url: "/protected" }))
        .statusCode,
    ).toBe(401);
    expect(
      (await forbiddenApp.inject({ headers: { authorization: "Bearer access_token" }, method: "GET", url: "/protected" }))
        .statusCode,
    ).toBe(403);
  });
});

async function buildProtectedApp(input: { repository: AuthenticationRepository; tokenService: TokenService }) {
  const app = Fastify({ logger: false });
  registerErrorHandler(app);
  await authenticationPlugin(app, {
    authenticationRepository: input.repository,
    tokenService: input.tokenService,
  });
  app.get("/protected", { preHandler: Authorization({ allowedUserTypes: ["MASTER"] }) }, async (request) => ({
    data: {
      sessionId: request.auth?.session.id,
      userId: request.auth?.user.id,
      userType: request.auth?.user.type,
    },
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

function tokenService(options: { organizationId?: string | null; type?: AuthenticationUser["type"] } = {}): TokenService {
  return {
    signAccessToken: vi.fn(),
    signRefreshToken: vi.fn(),
    verifyAccessToken: vi.fn(async () => ({
      organizationId: options.organizationId ?? null,
      sessionId: "session_1",
      tokenId: "access_jti",
      type: options.type ?? "MASTER",
      userId: "user_master",
    })),
    verifyRefreshToken: vi.fn(),
  };
}

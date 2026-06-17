import { describe, expect, it, vi } from "vitest";
import type { AuthenticationRepository, PasswordHasher, RefreshTokenHasher, TokenService } from "../../../application/authentication/authentication-repository.js";
import type { PersistedRefreshToken } from "../../../domain/authentication/refresh-token.js";
import type { AuthenticationUser } from "../../../domain/authentication/user.js";
import type { UserSession } from "../../../domain/authentication/user-session.js";
import { buildServer } from "../build-server.js";

const activeUser: AuthenticationUser = {
  email: "organizacao@flora.local",
  id: "user_org",
  isActive: true,
  organizationId: "org_1",
  organizationIsActive: true,
  passwordHash: "hash",
  type: "ORGANIZATION",
};

const activeSession: UserSession = {
  expiresAt: new Date("2026-07-17T00:00:00.000Z"),
  id: "session_1",
  lastUsedAt: new Date("2026-06-17T00:00:00.000Z"),
  organizationId: "org_1",
  revokedAt: null,
  revokedReason: null,
  status: "ACTIVE",
  userId: "user_org",
};

const activeRefreshToken: PersistedRefreshToken = {
  expiresAt: new Date("2026-07-17T00:00:00.000Z"),
  id: "refresh_1",
  replacedByTokenId: null,
  revokedAt: null,
  rotatedAt: null,
  sessionId: "session_1",
  status: "ACTIVE",
  tokenHash: "hashed_refresh_token",
  usedAt: null,
};

describe("auth session routes", () => {
  it("returns the current session for a valid bearer token", async () => {
    const app = await buildServer({
      authenticationRepository: buildRepository(),
      passwordHasher: passwordHasher(),
      refreshTokenHasher,
      tokenService: tokenService(),
    });

    const response = await app.inject({
      headers: { authorization: "Bearer access_token" },
      method: "GET",
      url: "/auth/me",
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

  it("rotates refresh tokens through POST /auth/refresh", async () => {
    const repository = buildRepository();
    const app = await buildServer({
      authenticationRepository: repository,
      passwordHasher: passwordHasher(),
      refreshTokenHasher,
      tokenService: tokenService(),
    });

    const response = await app.inject({
      method: "POST",
      payload: { refreshToken: "refresh_token" },
      url: "/auth/refresh",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.tokens).toEqual({
      accessToken: "new_access",
      accessTokenExpiresAt: "2026-06-17T00:15:00.000Z",
      refreshToken: "new_refresh",
      refreshTokenExpiresAt: "2026-07-17T00:00:00.000Z",
      tokenType: "Bearer",
    });
    expect(repository.rotateRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({
        previousTokenId: "refresh_1",
      }),
    );
  });

  it("rejects missing bearer and missing refresh token", async () => {
    const app = await buildServer({
      authenticationRepository: buildRepository(),
      passwordHasher: passwordHasher(),
      refreshTokenHasher,
      tokenService: tokenService(),
    });

    const current = await app.inject({ method: "GET", url: "/auth/me" });
    const refresh = await app.inject({ method: "POST", payload: {}, url: "/auth/refresh" });

    expect(current.statusCode).toBe(401);
    expect(refresh.statusCode).toBe(400);
  });
});

function buildRepository(): AuthenticationRepository {
  return {
    createRefreshToken: vi.fn(),
    createSession: vi.fn(),
    extendSession: vi.fn(),
    findRefreshTokenByHash: vi.fn(async () => ({
      refreshToken: activeRefreshToken,
      session: activeSession,
      user: activeUser,
    })),
    findSessionWithUser: vi.fn(async () => ({ session: activeSession, user: activeUser })),
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
    recordAuditEvent: vi.fn(),
    revokeRefreshTokensForSession: vi.fn(),
    revokeSession: vi.fn(),
    rotateRefreshToken: vi.fn(async (input) => ({
      ...input.newToken,
      id: "refresh_2",
      replacedByTokenId: null,
      revokedAt: null,
      rotatedAt: null,
      status: "ACTIVE",
      usedAt: null,
    })),
    updateRefreshTokenStatus: vi.fn(),
    updateSessionStatus: vi.fn(),
    updateUserLastLogin: vi.fn(),
  };
}

function passwordHasher(): PasswordHasher {
  return {
    hash: vi.fn(),
    verify: vi.fn(),
  };
}

const refreshTokenHasher: RefreshTokenHasher = {
  hash: (token) => `hashed_${token}`,
};

function tokenService(): TokenService {
  return {
    signAccessToken: vi.fn(async () => ({
      expiresAt: new Date("2026-06-17T00:15:00.000Z"),
      token: "new_access",
      tokenId: "access_jti_2",
    })),
    signRefreshToken: vi.fn(async () => ({
      expiresAt: new Date("2026-07-17T00:00:00.000Z"),
      token: "new_refresh",
      tokenId: "refresh_jti_2",
    })),
    verifyAccessToken: vi.fn(async () => ({
      organizationId: "org_1",
      sessionId: "session_1",
      tokenId: "access_jti",
      type: "ORGANIZATION" as const,
      userId: "user_org",
    })),
    verifyRefreshToken: vi.fn(async () => ({
      sessionId: "session_1",
      tokenId: "refresh_jti",
      userId: "user_org",
    })),
  };
}

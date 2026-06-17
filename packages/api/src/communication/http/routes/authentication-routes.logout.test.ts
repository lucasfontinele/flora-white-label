import { describe, expect, it, vi } from "vitest";
import type { AuthenticationRepository, PasswordHasher, RefreshTokenHasher, TokenService } from "../../../application/authentication/authentication-repository.js";
import type { AuthenticationUser } from "../../../domain/authentication/user.js";
import type { UserSession } from "../../../domain/authentication/user-session.js";
import { buildServer } from "../build-server.js";

const activeUser: AuthenticationUser = {
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

describe("POST /auth/logout", () => {
  it("revokes the current session and returns signedOut", async () => {
    const repository = buildRepository();
    const app = await buildServer({
      authenticationRepository: repository,
      passwordHasher: passwordHasher(),
      refreshTokenHasher,
      tokenService: tokenService(),
    });

    const response = await app.inject({
      headers: { authorization: "Bearer access_token" },
      method: "POST",
      url: "/auth/logout",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: { signedOut: true } });
    expect(repository.revokeSession).toHaveBeenCalledWith("session_1", "logout", expect.any(Date));
    expect(repository.revokeRefreshTokensForSession).toHaveBeenCalledWith("session_1", expect.any(Date));
  });

  it("rejects missing bearer token", async () => {
    const app = await buildServer({
      authenticationRepository: buildRepository(),
      passwordHasher: passwordHasher(),
      refreshTokenHasher,
      tokenService: tokenService(),
    });

    const response = await app.inject({ method: "POST", url: "/auth/logout" });

    expect(response.statusCode).toBe(401);
  });
});

function buildRepository(): AuthenticationRepository {
  return {
    createRefreshToken: vi.fn(),
    createSession: vi.fn(),
    extendSession: vi.fn(),
    findRefreshTokenByHash: vi.fn(),
    findSessionWithUser: vi.fn(async () => ({ session: activeSession, user: activeUser })),
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
    signAccessToken: vi.fn(),
    signRefreshToken: vi.fn(),
    verifyAccessToken: vi.fn(async () => ({
      organizationId: null,
      sessionId: "session_1",
      tokenId: "access_jti",
      type: "MASTER" as const,
      userId: "user_master",
    })),
    verifyRefreshToken: vi.fn(),
  };
}

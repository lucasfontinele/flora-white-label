import { describe, expect, it, vi } from "vitest";
import type { AuthenticationRepository, PasswordHasher, RefreshTokenHasher, TokenService } from "../../../application/authentication/authentication-repository.js";
import type { AuthenticationUser } from "../../../domain/authentication/user.js";
import type { UserSession } from "../../../domain/authentication/user-session.js";
import { buildServer } from "../build-server.js";

const activeMaster: AuthenticationUser = {
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

describe("POST /auth/login", () => {
  it("creates an API auth session and returns token DTOs for valid credentials", async () => {
    const repository = buildRepository(activeMaster);
    const app = await buildServer({
      authenticationRepository: repository,
      passwordHasher: passwordHasher(true),
      refreshTokenHasher,
      tokenService: tokenService(),
    });

    const response = await app.inject({
      method: "POST",
      payload: { email: "MASTER@flora.local", password: "Acesso@123" },
      url: "/auth/login",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: {
        session: {
          expiresAt: "2026-07-17T00:00:00.000Z",
          id: "session_1",
          organizationId: null,
          userId: "user_master",
        },
        tokens: {
          accessToken: "access_token",
          accessTokenExpiresAt: "2026-06-17T00:15:00.000Z",
          refreshToken: "refresh_token",
          refreshTokenExpiresAt: "2026-07-17T00:00:00.000Z",
          tokenType: "Bearer",
        },
        user: {
          email: "master@flora.local",
          id: "user_master",
          organizationId: null,
          type: "MASTER",
        },
      },
    });
    expect(repository.createSession).toHaveBeenCalledWith(expect.objectContaining({ ipAddress: "127.0.0.1" }));
    expect(repository.createRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: "session_1", tokenHash: "hashed_refresh_token" }),
    );
  });

  it("returns generic credential errors and never echoes secrets on failure", async () => {
    const app = await buildServer({
      authenticationRepository: buildRepository(activeMaster),
      passwordHasher: passwordHasher(false),
      refreshTokenHasher,
      tokenService: tokenService(),
    });

    const response = await app.inject({
      method: "POST",
      payload: { email: "master@flora.local", password: "senha-errada" },
      url: "/auth/login",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Credenciais inválidas.",
      },
    });
    expect(response.body).not.toContain("senha-errada");
    expect(response.body).not.toContain("hash");
    expect(response.body).not.toContain("access_token");
    expect(response.body).not.toContain("refresh_token");
  });

  it("rejects malformed payloads before creating sessions", async () => {
    const repository = buildRepository(activeMaster);
    const app = await buildServer({
      authenticationRepository: repository,
      passwordHasher: passwordHasher(true),
      refreshTokenHasher,
      tokenService: tokenService(),
    });

    const response = await app.inject({
      method: "POST",
      payload: { email: "invalid", password: "" },
      url: "/auth/login",
    });

    expect(response.statusCode).toBe(400);
    expect(repository.createSession).not.toHaveBeenCalled();
  });
});

function buildRepository(user: AuthenticationUser | null): AuthenticationRepository {
  return {
    createRefreshToken: vi.fn(async (input) => ({
      ...input,
      id: "refresh_1",
      replacedByTokenId: null,
      revokedAt: null,
      rotatedAt: null,
      status: "ACTIVE",
      usedAt: null,
    })),
    createSession: vi.fn(async () => activeSession),
    extendSession: vi.fn(),
    findRefreshTokenByHash: vi.fn(),
    findSessionWithUser: vi.fn(),
    findUserByEmail: vi.fn(async () => user),
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

function passwordHasher(matches: boolean): PasswordHasher {
  return {
    hash: vi.fn(),
    verify: vi.fn(async () => matches),
  };
}

const refreshTokenHasher: RefreshTokenHasher = {
  hash: (token) => `hashed_${token}`,
};

function tokenService(): TokenService {
  return {
    signAccessToken: vi.fn(async () => ({
      expiresAt: new Date("2026-06-17T00:15:00.000Z"),
      token: "access_token",
      tokenId: "access_jti",
    })),
    signRefreshToken: vi.fn(async () => ({
      expiresAt: new Date("2026-07-17T00:00:00.000Z"),
      token: "refresh_token",
      tokenId: "refresh_jti",
    })),
    verifyAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
  };
}

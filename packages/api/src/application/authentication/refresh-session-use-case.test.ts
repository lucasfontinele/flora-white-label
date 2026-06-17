import { describe, expect, it, vi } from "vitest";
import type { PersistedRefreshToken } from "../../domain/authentication/refresh-token.js";
import type { AuthenticationUser } from "../../domain/authentication/user.js";
import type { UserSession } from "../../domain/authentication/user-session.js";
import type { AuthenticationRepository, RefreshTokenHasher, TokenService } from "./authentication-repository.js";
import { RefreshSessionUseCase } from "./refresh-session-use-case.js";

const activeUser: AuthenticationUser = {
  email: "paciente@flora.local",
  id: "user_standard",
  isActive: true,
  organizationId: "org_1",
  organizationIsActive: true,
  passwordHash: "hash",
  type: "STANDARD",
};

const activeSession: UserSession = {
  expiresAt: new Date("2026-07-17T00:00:00.000Z"),
  id: "session_1",
  lastUsedAt: new Date("2026-06-17T00:00:00.000Z"),
  organizationId: "org_1",
  revokedAt: null,
  revokedReason: null,
  status: "ACTIVE",
  userId: "user_standard",
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

describe("RefreshSessionUseCase", () => {
  it("rotates the refresh token and extends the current session", async () => {
    const repository = buildRepository({
      refreshToken: activeRefreshToken,
      session: activeSession,
      user: activeUser,
    });
    const useCase = new RefreshSessionUseCase(repository, refreshTokenHasher, tokenService());
    const now = new Date("2026-06-17T00:10:00.000Z");

    const response = await useCase.execute("refresh_token", { ipAddress: "127.0.0.1", userAgent: "vitest" }, now);

    expect(response.data.tokens).toEqual({
      accessToken: "new_access",
      accessTokenExpiresAt: "2026-06-17T00:25:00.000Z",
      refreshToken: "new_refresh",
      refreshTokenExpiresAt: "2026-07-17T00:10:00.000Z",
      tokenType: "Bearer",
    });
    expect(repository.rotateRefreshToken).toHaveBeenCalledWith({
      newToken: {
        expiresAt: new Date("2026-07-17T00:10:00.000Z"),
        sessionId: "session_1",
        tokenHash: "hashed_new_refresh",
      },
      now,
      previousTokenId: "refresh_1",
    });
    expect(repository.extendSession).toHaveBeenCalledWith("session_1", new Date("2026-07-17T00:10:00.000Z"), now);
    expect(repository.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "REFRESH_SUCCESS" }));
  });

  it("detects reuse of a non-active refresh token and revokes the session", async () => {
    const repository = buildRepository({
      refreshToken: { ...activeRefreshToken, status: "ROTATED" },
      session: activeSession,
      user: activeUser,
    });
    const now = new Date("2026-06-17T00:10:00.000Z");

    await expect(new RefreshSessionUseCase(repository, refreshTokenHasher, tokenService()).execute("refresh_token", {}, now))
      .rejects.toThrow("Sessão inválida.");

    expect(repository.updateRefreshTokenStatus).toHaveBeenCalledWith("refresh_1", "REUSED", now);
    expect(repository.revokeSession).toHaveBeenCalledWith("session_1", "refresh_token_reuse", now);
    expect(repository.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "REFRESH_REUSE_DETECTED" }));
  });

  it("rejects expired tokens, revoked sessions, inactive users, and inactive organizations", async () => {
    await expect(
      new RefreshSessionUseCase(
        buildRepository({
          refreshToken: { ...activeRefreshToken, expiresAt: new Date("2026-06-16T23:59:59.000Z") },
          session: activeSession,
          user: activeUser,
        }),
        refreshTokenHasher,
        tokenService(),
      ).execute("refresh_token", {}, new Date("2026-06-17T00:00:00.000Z")),
    ).rejects.toThrow("Sessão inválida.");

    await expect(
      new RefreshSessionUseCase(
        buildRepository({
          refreshToken: activeRefreshToken,
          session: { ...activeSession, status: "REVOKED" },
          user: activeUser,
        }),
        refreshTokenHasher,
        tokenService(),
      ).execute("refresh_token"),
    ).rejects.toThrow("Sessão inválida.");

    await expect(
      new RefreshSessionUseCase(
        buildRepository({
          refreshToken: activeRefreshToken,
          session: activeSession,
          user: { ...activeUser, isActive: false },
        }),
        refreshTokenHasher,
        tokenService(),
      ).execute("refresh_token"),
    ).rejects.toThrow("Sessão inválida.");

    await expect(
      new RefreshSessionUseCase(
        buildRepository({
          refreshToken: activeRefreshToken,
          session: activeSession,
          user: { ...activeUser, organizationIsActive: false },
        }),
        refreshTokenHasher,
        tokenService(),
      ).execute("refresh_token"),
    ).rejects.toThrow("Sessão inválida.");
  });

  it("rejects token claim mismatches and unknown persisted tokens", async () => {
    await expect(
      new RefreshSessionUseCase(buildRepository(null), refreshTokenHasher, tokenService()).execute("refresh_token"),
    ).rejects.toThrow("Sessão inválida.");

    await expect(
      new RefreshSessionUseCase(
        buildRepository({
          refreshToken: activeRefreshToken,
          session: activeSession,
          user: activeUser,
        }),
        refreshTokenHasher,
        tokenService({ userId: "other_user" }),
      ).execute("refresh_token"),
    ).rejects.toThrow("Sessão inválida.");
  });
});

function buildRepository(result: { refreshToken: PersistedRefreshToken; session: UserSession; user: AuthenticationUser } | null): AuthenticationRepository {
  return {
    createRefreshToken: vi.fn(),
    createSession: vi.fn(),
    extendSession: vi.fn(),
    findRefreshTokenByHash: vi.fn(async () => result),
    findSessionWithUser: vi.fn(),
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

const refreshTokenHasher: RefreshTokenHasher = {
  hash: (token) => `hashed_${token}`,
};

function tokenService(options: { userId?: string } = {}): TokenService {
  return {
    signAccessToken: vi.fn(async () => ({
      expiresAt: new Date("2026-06-17T00:25:00.000Z"),
      token: "new_access",
      tokenId: "access_jti_2",
    })),
    signRefreshToken: vi.fn(async () => ({
      expiresAt: new Date("2026-07-17T00:10:00.000Z"),
      token: "new_refresh",
      tokenId: "refresh_jti_2",
    })),
    verifyAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn(async () => ({
      sessionId: "session_1",
      tokenId: "refresh_jti_1",
      userId: options.userId ?? "user_standard",
    })),
  };
}

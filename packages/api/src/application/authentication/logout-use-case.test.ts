import { describe, expect, it, vi } from "vitest";
import type { AuthenticationUser } from "../../domain/authentication/user.js";
import type { UserSession } from "../../domain/authentication/user-session.js";
import type { AuthenticationRepository, TokenService } from "./authentication-repository.js";
import { LogoutUseCase } from "./logout-use-case.js";

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

describe("LogoutUseCase", () => {
  it("revokes the active current session, its refresh tokens, and records logout", async () => {
    const repository = buildRepository({ session: activeSession, user: activeUser });
    const now = new Date("2026-06-17T00:10:00.000Z");

    await expect(
      new LogoutUseCase(repository, tokenService()).execute("access_token", { ipAddress: "127.0.0.1", userAgent: "vitest" }, now),
    ).resolves.toEqual({ data: { signedOut: true } });

    expect(repository.revokeSession).toHaveBeenCalledWith("session_1", "logout", now);
    expect(repository.revokeRefreshTokensForSession).toHaveBeenCalledWith("session_1", now);
    expect(repository.recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        ipAddress: "127.0.0.1",
        sessionId: "session_1",
        type: "LOGOUT",
        userAgent: "vitest",
        userId: "user_master",
      }),
    );
  });

  it("is idempotent for already revoked or expired sessions that still resolve from a verified token", async () => {
    const repository = buildRepository({
      session: { ...activeSession, status: "REVOKED" },
      user: activeUser,
    });

    await expect(new LogoutUseCase(repository, tokenService()).execute("access_token")).resolves.toEqual({
      data: { signedOut: true },
    });

    expect(repository.revokeSession).not.toHaveBeenCalled();
    expect(repository.revokeRefreshTokensForSession).not.toHaveBeenCalled();
    expect(repository.recordAuditEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "LOGOUT" }));
  });

  it("rejects missing sessions, claim mismatches, and invalid access tokens", async () => {
    await expect(new LogoutUseCase(buildRepository(null), tokenService()).execute("access_token")).rejects.toThrow(
      "Sessão inválida.",
    );

    await expect(
      new LogoutUseCase(buildRepository({ session: activeSession, user: activeUser }), tokenService({ userId: "other_user" }))
        .execute("access_token"),
    ).rejects.toThrow("Sessão inválida.");

    await expect(
      new LogoutUseCase(buildRepository({ session: activeSession, user: activeUser }), tokenService({ rejectAccess: true }))
        .execute("access_token"),
    ).rejects.toThrow("Sessão inválida.");
  });
});

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

function tokenService(options: { rejectAccess?: boolean; userId?: string } = {}): TokenService {
  return {
    signAccessToken: vi.fn(),
    signRefreshToken: vi.fn(),
    verifyAccessToken: vi.fn(async () => {
      if (options.rejectAccess) throw new Error("Sessão inválida.");

      return {
        organizationId: null,
        sessionId: "session_1",
        tokenId: "access_jti",
        type: "MASTER" as const,
        userId: options.userId ?? "user_master",
      };
    }),
    verifyRefreshToken: vi.fn(),
  };
}

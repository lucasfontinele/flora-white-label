import { describe, expect, it, vi } from "vitest";
import type { AuthenticationUser } from "../../domain/authentication/user.js";
import type { UserSession } from "../../domain/authentication/user-session.js";
import type { AuthenticationRepository, TokenService } from "./authentication-repository.js";
import { GetCurrentSessionUseCase } from "./get-current-session-use-case.js";

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

describe("GetCurrentSessionUseCase", () => {
  it("returns the current user and session for a valid active access token", async () => {
    const repository = buildRepository({ session: activeSession, user: activeUser });
    const useCase = new GetCurrentSessionUseCase(repository, tokenService());

    await expect(useCase.execute("access_token", new Date("2026-06-17T00:00:00.000Z"))).resolves.toEqual({
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

  it("rejects missing sessions and tenant-scope mismatches", async () => {
    await expect(
      new GetCurrentSessionUseCase(buildRepository(null), tokenService()).execute("access_token"),
    ).rejects.toThrow("Sessão inválida.");

    await expect(
      new GetCurrentSessionUseCase(
        buildRepository({ session: activeSession, user: { ...activeUser, organizationId: "org_2" } }),
        tokenService(),
      ).execute("access_token"),
    ).rejects.toThrow("Sessão inválida.");
  });

  it("rejects expired, revoked, inactive-user, and invalid-token sessions", async () => {
    await expect(
      new GetCurrentSessionUseCase(
        buildRepository({ session: { ...activeSession, expiresAt: new Date("2026-06-16T23:59:59.000Z") }, user: activeUser }),
        tokenService(),
      ).execute("access_token", new Date("2026-06-17T00:00:00.000Z")),
    ).rejects.toThrow("Sessão inválida.");

    await expect(
      new GetCurrentSessionUseCase(
        buildRepository({ session: { ...activeSession, status: "REVOKED" }, user: activeUser }),
        tokenService(),
      ).execute("access_token"),
    ).rejects.toThrow("Sessão inválida.");

    await expect(
      new GetCurrentSessionUseCase(
        buildRepository({ session: activeSession, user: { ...activeUser, isActive: false } }),
        tokenService(),
      ).execute("access_token"),
    ).rejects.toThrow("Sessão inválida.");

    await expect(
      new GetCurrentSessionUseCase(buildRepository({ session: activeSession, user: activeUser }), tokenService({ rejectAccess: true }))
        .execute("expired_access_token"),
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

function tokenService(options: { rejectAccess?: boolean } = {}): TokenService {
  return {
    signAccessToken: vi.fn(),
    signRefreshToken: vi.fn(),
    verifyAccessToken: vi.fn(async () => {
      if (options.rejectAccess) throw new Error("Sessão inválida.");

      return {
        organizationId: "org_1",
        sessionId: "session_1",
        tokenId: "access_jti",
        type: "ORGANIZATION" as const,
        userId: "user_org",
      };
    }),
    verifyRefreshToken: vi.fn(),
  };
}

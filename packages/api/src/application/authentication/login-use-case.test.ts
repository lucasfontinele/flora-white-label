import { describe, expect, it, vi } from "vitest";
import type { AuthenticationRepository, PasswordHasher, RefreshTokenHasher, TokenService } from "./authentication-repository.js";
import { LoginUseCase } from "./login-use-case.js";
import type { AuthenticationUser } from "../../domain/authentication/user.js";
import type { UserSession } from "../../domain/authentication/user-session.js";

const activeMaster: AuthenticationUser = {
  email: "master@flora.local",
  id: "user_master",
  isActive: true,
  organizationId: null,
  organizationIsActive: null,
  passwordHash: "hash",
  type: "MASTER",
};

const session: UserSession = {
  expiresAt: new Date("2026-07-17T00:00:00.000Z"),
  id: "session_1",
  lastUsedAt: new Date("2026-06-17T00:00:00.000Z"),
  organizationId: null,
  revokedAt: null,
  revokedReason: null,
  status: "ACTIVE",
  userId: "user_master",
};

describe("LoginUseCase", () => {
  it("creates a session and token pair for active users with valid credentials", async () => {
    const repository = buildRepository({ user: activeMaster });
    const useCase = new LoginUseCase(repository, passwordHasher(true), refreshTokenHasher, tokenService, 60);

    const response = await useCase.execute({ email: "MASTER@flora.local", password: "Acesso@123" });

    expect(response.data.user).toEqual({
      email: "master@flora.local",
      id: "user_master",
      organizationId: null,
      type: "MASTER",
    });
    expect(response.data.session.id).toBe("session_1");
    expect(response.data.tokens.accessToken).toBe("access_session_1");
    expect(response.data.tokens.refreshToken).toBe("refresh_session_1");
    expect(repository.createSession).toHaveBeenCalledOnce();
    expect(repository.createRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: "session_1", tokenHash: "hashed_refresh_session_1" }),
    );
  });

  it("rejects unknown emails with a generic message", async () => {
    const repository = buildRepository({ user: null });
    const useCase = new LoginUseCase(repository, passwordHasher(true), refreshTokenHasher, tokenService);

    await expect(useCase.execute({ email: "missing@flora.local", password: "Acesso@123" })).rejects.toThrow(
      "Credenciais inválidas.",
    );
    expect(repository.createSession).not.toHaveBeenCalled();
  });

  it("rejects wrong passwords with a generic message", async () => {
    const repository = buildRepository({ user: activeMaster });
    const useCase = new LoginUseCase(repository, passwordHasher(false), refreshTokenHasher, tokenService);

    await expect(useCase.execute({ email: "master@flora.local", password: "errada" })).rejects.toThrow(
      "Credenciais inválidas.",
    );
  });

  it("rejects inactive users and inactive organization users", async () => {
    const inactiveUser = { ...activeMaster, isActive: false };
    const inactiveOrganizationUser: AuthenticationUser = {
      ...activeMaster,
      organizationId: "org_1",
      organizationIsActive: false,
      type: "ORGANIZATION",
    };

    await expect(
      new LoginUseCase(buildRepository({ user: inactiveUser }), passwordHasher(true), refreshTokenHasher, tokenService)
        .execute({ email: "master@flora.local", password: "Acesso@123" }),
    ).rejects.toThrow("Credenciais inválidas.");
    await expect(
      new LoginUseCase(
        buildRepository({ user: inactiveOrganizationUser }),
        passwordHasher(true),
        refreshTokenHasher,
        tokenService,
      ).execute({ email: "organizacao@flora.local", password: "Acesso@123" }),
    ).rejects.toThrow("Credenciais inválidas.");
  });
});

function buildRepository({ user }: { user: AuthenticationUser | null }): AuthenticationRepository {
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
    createSession: vi.fn(async () => session),
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

const tokenService: TokenService = {
  signAccessToken: vi.fn(async (input) => ({
    expiresAt: new Date("2026-06-17T00:15:00.000Z"),
    token: `access_${input.sessionId}`,
    tokenId: "access_jti",
  })),
  signRefreshToken: vi.fn(async (input) => ({
    expiresAt: new Date("2026-07-17T00:00:00.000Z"),
    token: `refresh_${input.sessionId}`,
    tokenId: "refresh_jti",
  })),
  verifyAccessToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
};

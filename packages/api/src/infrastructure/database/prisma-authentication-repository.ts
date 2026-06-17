import type { Prisma, PrismaClient } from "@prisma/client";
import type {
  AuthenticationRepository,
  CreateRefreshTokenInput,
  CreateSessionInput,
  RefreshTokenWithSession,
  RotateRefreshTokenInput,
  SessionWithUser,
} from "../../application/authentication/authentication-repository.js";
import type { AuthenticationAuditEvent } from "../../domain/authentication/authentication-audit-event.js";
import type { AuthenticationUser } from "../../domain/authentication/user.js";
import type { PersistedRefreshToken, RefreshTokenStatus } from "../../domain/authentication/refresh-token.js";
import type { UserSession, UserSessionStatus } from "../../domain/authentication/user-session.js";
import { prisma as defaultPrisma } from "./prisma-client.js";
import {
  mapAuthenticatedUserProfile,
  type PatientGuardianRecord,
  type PatientRecord,
} from "./prisma-patient-profile-mappers.js";

const authenticationUserInclude = {
  organization: {
    select: {
      isActive: true,
    },
  },
  patient: {
    include: {
      address: true,
      pet: true,
    },
  },
  patientGuardians: {
    include: {
      address: true,
      patient: {
        include: {
          address: true,
          pet: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} as const;

export class PrismaAuthenticationRepository implements AuthenticationRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async findUserByEmail(email: string): Promise<AuthenticationUser | null> {
    const user = await this.client.user.findUnique({
      include: authenticationUserInclude,
      where: { email },
    });

    return user ? mapUser(user) : null;
  }

  async findUserById(userId: string): Promise<AuthenticationUser | null> {
    const user = await this.client.user.findUnique({
      include: authenticationUserInclude,
      where: { id: userId },
    });

    return user ? mapUser(user) : null;
  }

  async createSession(input: CreateSessionInput): Promise<UserSession> {
    const session = await this.client.userSession.create({
      data: {
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        userId: input.userId,
      },
      include: {
        user: true,
      },
    });

    return mapSession(session, input.organizationId);
  }

  async createRefreshToken(input: CreateRefreshTokenInput): Promise<PersistedRefreshToken> {
    const refreshToken = await this.client.refreshToken.create({
      data: input,
    });

    return mapRefreshToken(refreshToken);
  }

  async extendSession(sessionId: string, expiresAt: Date, lastUsedAt: Date): Promise<void> {
    await this.client.userSession.update({
      data: {
        expiresAt,
        lastUsedAt,
      },
      where: { id: sessionId },
    });
  }

  async findSessionWithUser(sessionId: string): Promise<SessionWithUser | null> {
    const session = await this.client.userSession.findUnique({
      include: {
        user: {
          include: authenticationUserInclude,
        },
      },
      where: { id: sessionId },
    });

    if (!session) return null;

    const user = mapUser(session.user);
    return {
      session: mapSession(session, user.organizationId),
      user,
    };
  }

  async findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenWithSession | null> {
    const refreshToken = await this.client.refreshToken.findUnique({
      include: {
        session: {
          include: {
            user: {
              include: authenticationUserInclude,
            },
          },
        },
      },
      where: { tokenHash },
    });

    if (!refreshToken) return null;

    const user = mapUser(refreshToken.session.user);
    return {
      refreshToken: mapRefreshToken(refreshToken),
      session: mapSession(refreshToken.session, user.organizationId),
      user,
    };
  }

  async rotateRefreshToken(input: RotateRefreshTokenInput): Promise<PersistedRefreshToken> {
    return this.client.$transaction(async (tx) => {
      const newToken = await tx.refreshToken.create({
        data: input.newToken,
      });

      await tx.refreshToken.update({
        data: {
          replacedByTokenId: newToken.id,
          rotatedAt: input.now,
          status: "ROTATED",
          usedAt: input.now,
        },
        where: { id: input.previousTokenId },
      });

      return mapRefreshToken(newToken);
    });
  }

  async updateRefreshTokenStatus(tokenId: string, status: RefreshTokenStatus, now: Date): Promise<void> {
    await this.client.refreshToken.update({
      data: {
        revokedAt: status === "REVOKED" || status === "REUSED" ? now : undefined,
        status,
        usedAt: status === "REUSED" ? now : undefined,
      },
      where: { id: tokenId },
    });
  }

  async revokeRefreshTokensForSession(sessionId: string, now: Date): Promise<void> {
    await this.client.refreshToken.updateMany({
      data: {
        revokedAt: now,
        status: "REVOKED",
      },
      where: {
        sessionId,
        status: "ACTIVE",
      },
    });
  }

  async revokeSession(sessionId: string, reason: string, now: Date): Promise<void> {
    await this.updateSessionStatus(sessionId, "REVOKED", reason, now);
    await this.revokeRefreshTokensForSession(sessionId, now);
  }

  async updateSessionStatus(
    sessionId: string,
    status: UserSessionStatus,
    reason: string,
    now: Date,
  ): Promise<void> {
    await this.client.userSession.update({
      data: {
        revokedAt: status === "REVOKED" ? now : undefined,
        revokedReason: status === "REVOKED" ? reason : undefined,
        status,
      },
      where: { id: sessionId },
    });
  }

  async updateUserLastLogin(userId: string, now: Date): Promise<void> {
    await this.client.user.update({
      data: { lastLoginAt: now },
      where: { id: userId },
    });
  }

  async recordAuditEvent(input: AuthenticationAuditEvent): Promise<void> {
    await this.client.authenticationAuditEvent.create({
      data: {
        emailAttempt: input.emailAttempt,
        ipAddress: input.ipAddress,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        sessionId: input.sessionId,
        type: input.type,
        userAgent: input.userAgent,
        userId: input.userId,
      },
    });
  }
}

function mapUser(user: {
  email: string;
  id: string;
  isActive: boolean;
  organization?: { isActive: boolean } | null;
  organizationId: string | null;
  patient?: PatientRecord | null;
  patientGuardians?: PatientGuardianRecord[];
  passwordHash: string;
  role?: string | null;
  type: string;
}): AuthenticationUser {
  return {
    email: user.email,
    id: user.id,
    isActive: user.isActive,
    organizationId: user.organizationId,
    organizationIsActive: user.organization?.isActive ?? null,
    passwordHash: user.passwordHash,
    profile: mapAuthenticatedUserProfile(user),
    role: isUserRole(user.role) ? user.role : null,
    type: user.type as AuthenticationUser["type"],
  };
}

function isUserRole(value: string | null | undefined): value is NonNullable<AuthenticationUser["role"]> {
  return value === "TUTOR" || value === "PATIENT";
}

function mapSession(
  session: {
    expiresAt: Date;
    id: string;
    ipAddress: string | null;
    lastUsedAt: Date;
    revokedAt: Date | null;
    revokedReason: string | null;
    status: string;
    userAgent: string | null;
    userId: string;
  },
  organizationId: string | null,
): UserSession {
  return {
    expiresAt: session.expiresAt,
    id: session.id,
    ipAddress: session.ipAddress ?? undefined,
    lastUsedAt: session.lastUsedAt,
    organizationId,
    revokedAt: session.revokedAt,
    revokedReason: session.revokedReason,
    status: session.status as UserSession["status"],
    userAgent: session.userAgent ?? undefined,
    userId: session.userId,
  };
}

function mapRefreshToken(refreshToken: {
  expiresAt: Date;
  id: string;
  replacedByTokenId: string | null;
  revokedAt: Date | null;
  rotatedAt: Date | null;
  sessionId: string;
  status: string;
  tokenHash: string;
  usedAt: Date | null;
}): PersistedRefreshToken {
  return {
    expiresAt: refreshToken.expiresAt,
    id: refreshToken.id,
    replacedByTokenId: refreshToken.replacedByTokenId,
    revokedAt: refreshToken.revokedAt,
    rotatedAt: refreshToken.rotatedAt,
    sessionId: refreshToken.sessionId,
    status: refreshToken.status as PersistedRefreshToken["status"],
    tokenHash: refreshToken.tokenHash,
    usedAt: refreshToken.usedAt,
  };
}

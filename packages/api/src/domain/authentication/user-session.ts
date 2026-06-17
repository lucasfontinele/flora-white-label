import type { AuthSessionDto } from "@flora/shared/authentication";

export type UserSessionStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

export type UserSession = {
  expiresAt: Date;
  id: string;
  ipAddress?: string;
  lastUsedAt: Date;
  organizationId: string | null;
  revokedAt: Date | null;
  revokedReason: string | null;
  status: UserSessionStatus;
  userAgent?: string;
  userId: string;
};

export function isSessionActive(session: Pick<UserSession, "expiresAt" | "status">, now = new Date()) {
  return session.status === "ACTIVE" && session.expiresAt.getTime() > now.getTime();
}

export function sessionToDto(session: UserSession): AuthSessionDto {
  return {
    expiresAt: session.expiresAt.toISOString(),
    id: session.id,
    organizationId: session.organizationId,
    userId: session.userId,
  };
}

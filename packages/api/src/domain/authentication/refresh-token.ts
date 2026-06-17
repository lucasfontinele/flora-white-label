export type RefreshTokenStatus = "ACTIVE" | "ROTATED" | "REVOKED" | "EXPIRED" | "REUSED";

export type PersistedRefreshToken = {
  expiresAt: Date;
  id: string;
  replacedByTokenId: string | null;
  revokedAt: Date | null;
  rotatedAt: Date | null;
  sessionId: string;
  status: RefreshTokenStatus;
  tokenHash: string;
  usedAt: Date | null;
};

export function isRefreshTokenActive(
  refreshToken: Pick<PersistedRefreshToken, "expiresAt" | "status">,
  now = new Date(),
) {
  return refreshToken.status === "ACTIVE" && refreshToken.expiresAt.getTime() > now.getTime();
}

export type AuthenticationAuditEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "REFRESH_SUCCESS"
  | "REFRESH_FAILURE"
  | "LOGOUT"
  | "SESSION_REVOKED"
  | "AUTHORIZATION_REJECTED"
  | "REFRESH_REUSE_DETECTED";

export type AuthenticationAuditEvent = {
  emailAttempt?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  type: AuthenticationAuditEventType;
  userAgent?: string;
  userId?: string;
};

export function sanitizeAuditMetadata(metadata: Record<string, unknown> | undefined) {
  if (!metadata) return undefined;

  const blockedKeys = new Set(["password", "passwordHash", "accessToken", "refreshToken", "tokenHash"]);
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !blockedKeys.has(key)));
}

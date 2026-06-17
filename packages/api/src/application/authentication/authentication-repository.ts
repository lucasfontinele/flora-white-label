import type { UserType } from "@flora/shared/authentication";
import type {
  AuthenticationAuditEvent,
  AuthenticationAuditEventType,
} from "../../domain/authentication/authentication-audit-event.js";
import type { AuthenticationUser } from "../../domain/authentication/user.js";
import type { UserSession, UserSessionStatus } from "../../domain/authentication/user-session.js";
import type { PersistedRefreshToken, RefreshTokenStatus } from "../../domain/authentication/refresh-token.js";

export type CreateSessionInput = {
  expiresAt: Date;
  ipAddress?: string;
  organizationId: string | null;
  userAgent?: string;
  userId: string;
};

export type CreateRefreshTokenInput = {
  expiresAt: Date;
  sessionId: string;
  tokenHash: string;
};

export type RotateRefreshTokenInput = {
  newToken: CreateRefreshTokenInput;
  now: Date;
  previousTokenId: string;
};

export type SessionWithUser = {
  session: UserSession;
  user: AuthenticationUser;
};

export type RefreshTokenWithSession = {
  refreshToken: PersistedRefreshToken;
  session: UserSession;
  user: AuthenticationUser;
};

export type AuthenticationRepository = {
  createRefreshToken(input: CreateRefreshTokenInput): Promise<PersistedRefreshToken>;
  createSession(input: CreateSessionInput): Promise<UserSession>;
  extendSession(sessionId: string, expiresAt: Date, lastUsedAt: Date): Promise<void>;
  findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenWithSession | null>;
  findSessionWithUser(sessionId: string): Promise<SessionWithUser | null>;
  findUserByEmail(email: string): Promise<AuthenticationUser | null>;
  findUserById(userId: string): Promise<AuthenticationUser | null>;
  recordAuditEvent(input: AuthenticationAuditEvent): Promise<void>;
  revokeRefreshTokensForSession(sessionId: string, now: Date): Promise<void>;
  revokeSession(sessionId: string, reason: string, now: Date): Promise<void>;
  rotateRefreshToken(input: RotateRefreshTokenInput): Promise<PersistedRefreshToken>;
  updateRefreshTokenStatus(tokenId: string, status: RefreshTokenStatus, now: Date): Promise<void>;
  updateSessionStatus(sessionId: string, status: UserSessionStatus, reason: string, now: Date): Promise<void>;
  updateUserLastLogin(userId: string, now: Date): Promise<void>;
};

export type PasswordHasher = {
  hash(password: string): Promise<string>;
  verify(passwordHash: string, password: string): Promise<boolean>;
};

export type RefreshTokenHasher = {
  hash(token: string): string;
};

export type AccessTokenClaims = {
  organizationId: string | null;
  sessionId: string;
  tokenId: string;
  type: UserType;
  userId: string;
};

export type RefreshTokenClaims = {
  sessionId: string;
  tokenId: string;
  userId: string;
};

export type SignedToken = {
  expiresAt: Date;
  token: string;
  tokenId: string;
};

export type TokenService = {
  signAccessToken(input: Omit<AccessTokenClaims, "tokenId">): Promise<SignedToken>;
  signRefreshToken(input: Omit<RefreshTokenClaims, "tokenId">): Promise<SignedToken>;
  verifyAccessToken(token: string): Promise<AccessTokenClaims>;
  verifyRefreshToken(token: string): Promise<RefreshTokenClaims>;
};

export type AuthRequestContext = {
  ipAddress?: string;
  userAgent?: string;
};

export type AuthenticationFailureAuditInput = {
  emailAttempt?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  type: AuthenticationAuditEventType;
  userAgent?: string;
};

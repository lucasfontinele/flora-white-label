CREATE TYPE "UserType" AS ENUM ('MASTER', 'ORGANIZATION', 'STANDARD');

CREATE TYPE "UserSessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

CREATE TYPE "RefreshTokenStatus" AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED', 'EXPIRED', 'REUSED');

CREATE TYPE "AuthenticationAuditEventType" AS ENUM (
  'LOGIN_SUCCESS',
  'LOGIN_FAILURE',
  'REFRESH_SUCCESS',
  'REFRESH_FAILURE',
  'LOGOUT',
  'SESSION_REVOKED',
  'AUTHORIZATION_REJECTED',
  'REFRESH_REUSE_DETECTED'
);

ALTER TABLE "organizations"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "type" "UserType" NOT NULL,
  "organizationId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_sessions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "UserSessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "userAgent" TEXT,
  "ipAddress" TEXT,
  "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "revokedReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "refresh_tokens" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "status" "RefreshTokenStatus" NOT NULL DEFAULT 'ACTIVE',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "rotatedAt" TIMESTAMP(3),
  "replacedByTokenId" TEXT,
  "usedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "authentication_audit_events" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT,
  "type" "AuthenticationAuditEventType" NOT NULL,
  "emailAttempt" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "authentication_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");
CREATE INDEX "user_sessions_status_idx" ON "user_sessions"("status");
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");
CREATE INDEX "refresh_tokens_sessionId_idx" ON "refresh_tokens"("sessionId");
CREATE INDEX "refresh_tokens_status_idx" ON "refresh_tokens"("status");
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

CREATE INDEX "authentication_audit_events_userId_idx" ON "authentication_audit_events"("userId");
CREATE INDEX "authentication_audit_events_sessionId_idx" ON "authentication_audit_events"("sessionId");
CREATE INDEX "authentication_audit_events_type_idx" ON "authentication_audit_events"("type");

ALTER TABLE "users"
  ADD CONSTRAINT "users_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user_sessions"
  ADD CONSTRAINT "user_sessions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "refresh_tokens"
  ADD CONSTRAINT "refresh_tokens_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "user_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "refresh_tokens"
  ADD CONSTRAINT "refresh_tokens_replacedByTokenId_fkey"
  FOREIGN KEY ("replacedByTokenId") REFERENCES "refresh_tokens"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "authentication_audit_events"
  ADD CONSTRAINT "authentication_audit_events_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "authentication_audit_events"
  ADD CONSTRAINT "authentication_audit_events_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "user_sessions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

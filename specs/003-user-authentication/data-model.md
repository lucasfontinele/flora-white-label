# Data Model: User Authentication

## User

Authentication-only account used to sign in to FloraApp.

Fields:

- `id`: string, required.
- `email`: string, required, unique, normalized to lowercase and trimmed.
- `passwordHash`: string, required, encoded argon2id hash.
- `type`: `MASTER | ORGANIZATION | STANDARD`, required.
- `organizationId`: string or null. Null for `MASTER`; required for tenant data
  access by `ORGANIZATION` and `STANDARD` users once their tenant profile
  exists.
- `isActive`: boolean, required, default true.
- `lastLoginAt`: date-time or null.
- `createdAt`: date-time.
- `updatedAt`: date-time.

Relationships:

- A user can have many sessions.
- A user can have many authentication audit events.
- `organizationId` optionally references `Organization.id` for tenant-scoped
  users.

Validation rules:

- Email must be syntactically valid and unique case-insensitively.
- Passwords used for provisioning or seed data must have at least 8 characters,
  at least one lowercase letter, and at least one number.
- `MASTER` users must not carry organization scope.
- `ORGANIZATION` and `STANDARD` users carry organization scope before they can
  access tenant-owned data.

Seed users:

| Type | Email | Password | Scope |
|------|-------|----------|-------|
| `MASTER` | `master@flora.local` | `Acesso@123` | Platform |
| `ORGANIZATION` | `organizacao@flora.local` | `Acesso@123` | Demo or first available organization |
| `STANDARD` | `paciente@flora.local` | `Acesso@123` | Demo or first available organization |

## UserSession

Server-side record for one authenticated browser/device session.

Fields:

- `id`: string, required.
- `userId`: string, required.
- `status`: `ACTIVE | REVOKED | EXPIRED`, required.
- `userAgent`: string or null, sanitized.
- `ipAddress`: string or null, sanitized.
- `createdAt`: date-time.
- `lastUsedAt`: date-time.
- `expiresAt`: date-time.
- `revokedAt`: date-time or null.
- `revokedReason`: string or null.

Relationships:

- Belongs to one user.
- Has many refresh tokens.
- Has many authentication audit events.

State transitions:

```text
created -> ACTIVE
ACTIVE -> REVOKED       (logout, admin/session revocation, suspicious reuse)
ACTIVE -> EXPIRED       (expiration cleanup or failed renewal after expiry)
REVOKED -> terminal
EXPIRED -> terminal
```

Validation rules:

- Only `ACTIVE` sessions can be renewed.
- A revoked or expired session cannot return to active state.
- Revoking one session must not revoke other sessions for the same user unless
  reuse detection intentionally invalidates a broader set in a future policy.

## RefreshToken

Persisted hash and lifecycle state for a rotating refresh JWT.

Fields:

- `id`: string, required.
- `sessionId`: string, required.
- `tokenHash`: string, required, unique.
- `status`: `ACTIVE | ROTATED | REVOKED | EXPIRED | REUSED`, required.
- `createdAt`: date-time.
- `expiresAt`: date-time.
- `rotatedAt`: date-time or null.
- `replacedByTokenId`: string or null.
- `usedAt`: date-time or null.
- `revokedAt`: date-time or null.

Relationships:

- Belongs to one `UserSession`.
- May point to the replacement refresh token after rotation.

State transitions:

```text
issued -> ACTIVE
ACTIVE -> ROTATED       (successful refresh creates replacement token)
ACTIVE -> REVOKED       (logout/session invalidation)
ACTIVE -> EXPIRED       (expiration)
ROTATED -> REUSED       (same token appears again after rotation)
REUSED -> terminal      (session invalidated)
```

Validation rules:

- Raw refresh tokens are never stored.
- Each refresh operation rotates the token.
- Reuse of a rotated token invalidates the affected session and records an
  audit event.

## AccessToken

Short-lived JWT used by the API to identify the authenticated request.

Claims:

- `sub`: user id.
- `sid`: session id.
- `typ`: user type.
- `org`: organization id when applicable.
- `jti`: token id.
- `iat`: issued-at timestamp.
- `exp`: expiration timestamp.

Validation rules:

- Token signature and expiration must be valid.
- The referenced session must still be active.
- The user must still be active.
- Organization-scoped users must not gain a different organization scope from
  the token than the persisted session/user scope.

## AuthenticationAuditEvent

Security event log for authentication and authorization behavior.

Fields:

- `id`: string, required.
- `userId`: string or null.
- `sessionId`: string or null.
- `type`: `LOGIN_SUCCESS | LOGIN_FAILURE | REFRESH_SUCCESS |
  REFRESH_FAILURE | LOGOUT | SESSION_REVOKED | AUTHORIZATION_REJECTED |
  REFRESH_REUSE_DETECTED`.
- `emailAttempt`: string or null for failed login diagnostics.
- `ipAddress`: string or null.
- `userAgent`: string or null.
- `metadata`: structured JSON without secrets.
- `createdAt`: date-time.

Validation rules:

- Passwords, password hashes, access tokens, refresh tokens, and token hashes
  must never be recorded.
- Failed login events may store normalized attempted email for diagnostics.

## WebSession

Server-managed IronSession payload in the web app.

Fields:

- `accessToken`: string, server-side only.
- `refreshToken`: string, server-side only.
- `user`: authenticated user summary returned to client components.
- `session`: session summary returned to client components.
- `accessTokenExpiresAt`: ISO date-time.
- `refreshTokenExpiresAt`: ISO date-time.

State transitions:

```text
anonymous -> signing-in -> authenticated
authenticated -> refreshing -> authenticated
authenticated -> signing-out -> anonymous
authenticated -> refresh-failed -> anonymous
```

Validation rules:

- Client components receive only user/session summaries, never raw tokens.
- The web session is cleared when API refresh or logout fails.

## Authorization Marker

Reusable declaration that a route or future controller operation requires a
valid authenticated session.

Fields:

- `required`: boolean, default true for the marker.
- `allowedUserTypes`: optional list of `UserType` values for later role gating.

Validation rules:

- In this feature, no existing production endpoint is marked.
- Isolated tests may attach the marker to a test route to verify missing,
  invalid, expired, revoked, and valid sessions.

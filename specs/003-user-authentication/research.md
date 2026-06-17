# Phase 0 Research: User Authentication

## Decision: Limit the first slice to login-only authentication

**Rationale**: The requester explicitly separated login from cadastro. This
keeps the first authentication feature focused on verifying existing users,
creating sessions, refreshing sessions, and signing out. User provisioning is
handled by local seed data now and by future registration/admin flows later.

**Alternatives considered**:

- Add public registration now. Rejected because it is explicitly out of scope.
- Build user management screens now. Rejected because the user asked for a
  future session control screen, not current user administration.

## Decision: Use one `User` authentication table with a `UserType` enum

**Rationale**: The authentication table should own credentials and login
identity only. `UserType` values `MASTER`, `ORGANIZATION`, and `STANDARD` cover
the three current personas without mixing profile fields into the auth model.
Role-specific domains can later reference `User.id` for profile and permission
data.

**Alternatives considered**:

- Separate login tables per persona. Rejected because credential/session logic
  would be duplicated and cross-role login would become harder to maintain.
- Put all profile fields into `User`. Rejected because authentication would
  become coupled to patient and organization employee registration details.

## Decision: Apply password policy to provisioning, not as credential disclosure

**Rationale**: The requested policy is minimum 8 characters, at least one
lowercase letter, and at least one number. Uppercase letters and symbols remain
allowed, so the test password `Acesso@123` is valid. Login responses remain
generic and must not reveal password-policy details as a reason for failure.

**Alternatives considered**:

- Require only a non-empty login password. Rejected because the requester
  supplied explicit password rules.
- Require symbols and uppercase letters. Rejected because the requester did not
  ask for that; allowing them keeps `Acesso@123` valid without over-constraining
  future passwords.

## Decision: Hash passwords with argon2id

**Rationale**: argon2id is the appropriate variant for password hashing because
it balances resistance to GPU attacks and side-channel concerns. The database
stores only the encoded hash and never stores or returns plaintext passwords.

**Alternatives considered**:

- bcrypt. Rejected because argon2 was explicitly requested and has stronger
  memory-hard properties.
- SHA-family hashes. Rejected because general-purpose hashes are not suitable
  for password storage.

## Decision: Use short-lived JWT access tokens plus rotating JWT refresh tokens

**Rationale**: Access tokens carry the user id, session id, user type,
organization scope when present, issued-at, expiration, and unique token id.
Refresh tokens also carry a unique id and session id, but the database stores
only a hash of the refresh token. Rotation lets the system invalidate sessions
and detect suspicious refresh-token reuse.

**Alternatives considered**:

- Stateless refresh tokens only. Rejected because the requested session control
  requires server-side invalidation.
- Opaque access tokens only. Rejected because JWT was explicitly requested.

## Decision: Store browser token state with IronSession in Next.js route handlers

**Rationale**: IronSession gives the web app encrypted, HTTP-only cookie-backed
session storage. The browser calls same-origin Next.js auth routes; those routes
call the API, store access/refresh tokens in the server-managed session, and
return only safe session summaries to client components.

**Alternatives considered**:

- Store tokens in localStorage. Rejected because it exposes secrets to browser
  JavaScript.
- Put API tokens directly in non-encrypted cookies. Rejected because the user
  specifically requested IronSession and because raw tokens should stay
  server-managed.

## Decision: Provide an authorization marker but do not apply it yet

**Rationale**: Future endpoints need a consistent way to require a valid
authenticated session. The current API uses Fastify route modules rather than
class controllers, so the first implementation should expose an
`Authorization` marker/preHandler compatible with route modules and future
controller wrappers. Existing endpoints must not be marked in this feature.

**Alternatives considered**:

- Immediately protect organization endpoints. Rejected because the requester
  explicitly said not to apply the decorator yet.
- Replace the existing route style with class controllers. Rejected because it
  would be a broad architectural change unrelated to login.

## Decision: Seed one local test user for each user type

**Rationale**: The requester needs immediate manual validation. A seed script can
upsert one `MASTER`, one `ORGANIZATION`, and one `STANDARD` user with password
`Acesso@123`, hashing the password through the same production hasher.

**Alternatives considered**:

- Put demo users directly in the migration. Rejected because migrations should
  define schema and stable reference data, while local demo users belong in a
  seed step.
- Require manual SQL inserts. Rejected because it bypasses password hashing and
  makes validation error-prone.

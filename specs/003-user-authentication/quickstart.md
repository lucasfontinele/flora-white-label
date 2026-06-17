# Quickstart: User Authentication

This guide validates login-only authentication end to end: user seed data,
password hashing, API token/session behavior, IronSession-backed web login, and
the authorization marker without applying it to existing endpoints.

## Prerequisites

- PostgreSQL and the API environment are configured for local development.
- Organization and subscription-plan migrations from previous features are
  applied.
- Auth environment variables are configured for local development:
  - API: JWT access secret, JWT refresh secret, access token lifetime, refresh
    token lifetime.
  - Web: IronSession password and API base URL.
- Dependencies planned for this feature are installed in the owning packages:
  `argon2` and JWT support in `@flora/api`; `iron-session` in `@flora/web`.

## Setup

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

Expected seeded login users:

| Type | Email | Password | Expected landing area |
|------|-------|----------|-----------------------|
| `MASTER` | `master@flora.local` | `Acesso@123` | `/painel` |
| `ORGANIZATION` | `organizacao@flora.local` | `Acesso@123` | `/operacional/dashboard` |
| `STANDARD` | `paciente@flora.local` | `Acesso@123` | `/dashboard` |

## Run Locally

In one terminal:

```bash
pnpm dev:api
```

In another terminal:

```bash
pnpm dev:web
```

Expected local targets:

- API: `http://localhost:3333`
- Web: `http://localhost:3000`
- Login page: `http://localhost:3000/entrar`

## API Contract Checks

Login as Master:

```bash
curl -s -X POST http://localhost:3333/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"master@flora.local","password":"Acesso@123"}'
```

Expected outcome: response matches
`contracts/authentication.openapi.yaml#/components/schemas/LoginResponse`,
contains a `MASTER` user summary, an active session id, and access/refresh JWTs.

Reject invalid credentials:

```bash
curl -s -X POST http://localhost:3333/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"master@flora.local","password":"senha-errada"}'
```

Expected outcome: response status is `401`, the error message is generic, and no
new active session is created.

Check current session:

```bash
ACCESS_TOKEN="<access token from login response>"

curl -s http://localhost:3333/auth/me \
  -H "authorization: Bearer ${ACCESS_TOKEN}"
```

Expected outcome: response matches `CurrentSessionResponse` and returns the same
user and session.

Refresh session:

```bash
REFRESH_TOKEN="<refresh token from login response>"

curl -s -X POST http://localhost:3333/auth/refresh \
  -H 'content-type: application/json' \
  -d "{\"refreshToken\":\"${REFRESH_TOKEN}\"}"
```

Expected outcome: response returns a new access token and a new refresh token;
reusing the previous refresh token invalidates the session.

Logout:

```bash
curl -s -X POST http://localhost:3333/auth/logout \
  -H "authorization: Bearer ${ACCESS_TOKEN}"
```

Expected outcome: response returns `{ "data": { "signedOut": true } }`, and the
same access/refresh credentials can no longer continue the session.

## Web Validation Scenarios

1. Open `/entrar`.
2. Submit each seeded account with `Acesso@123`.
3. Confirm the login request goes through the web auth route and the browser
   receives only an HTTP-only IronSession cookie, not raw tokens in client state.
4. Confirm each user type lands in the expected area:
   - `MASTER` -> `/painel`
   - `ORGANIZATION` -> `/operacional/dashboard`
   - `STANDARD` -> `/dashboard`
5. Reload the browser and confirm the session remains recognized while valid.
6. Trigger sign-out and confirm the web session cookie is cleared and the user
   returns to the signed-out flow.
7. Attempt a bad password and confirm the form shows a generic authentication
   message without clearing the email field.

## Authorization Marker Checks

1. Add only an isolated test route or test harness that uses the new
   `Authorization` marker.
2. Confirm missing, malformed, expired, revoked, and reused credentials are
   rejected with structured authorization errors.
3. Confirm a valid active session is accepted and exposes user id, user type,
   session id, and organization scope to the handler.
4. Confirm existing organization and subscription-plan endpoints have no new
   auth marker applied in this feature.

## Automated Gates

```bash
pnpm test:api
pnpm test:web
pnpm typecheck
pnpm build
```

Expected outcome: API tests cover password policy, argon2 verification, login,
failed login, current session, refresh rotation, reuse invalidation, logout,
seed users, and authorization marker behavior. Web tests cover login validation,
successful sign-in routing by user type, failed sign-in, session lookup, and
logout clearing the IronSession-backed state.

## Implementation Validation Results

Recorded on 2026-06-17:

- `pnpm prisma:generate`: passed.
- `pnpm test`: passed with API and web suites.
- `pnpm typecheck`: passed for shared, API, and web packages.
- `pnpm build`: passed after allowing network access for Next.js Google Font
  download during production build.
- Focused TypeScript check for `packages/api/prisma/seed.ts`: passed with
  explicit Node types.

Local HTTP smoke checks against `localhost:3000` and `localhost:3333` could not
be completed from this sandbox because local socket connections were blocked.
Run the setup and web validation scenarios above in the normal development
terminal after applying migrations and seed data.

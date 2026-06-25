# Quickstart: Autenticação Backend

## Scope

Validate only backend login behavior for `POST /auth/login`.

Out of scope for this validation: frontend, cookies, IronSession, logout,
refresh token, `/me`, RBAC, authorization middleware, registration, and password
recovery.

## Prerequisites

- Dependencies installed.
- API environment configured with `DATABASE_URL`.
- JWT signing configuration added during implementation.
- At least three existing users available for acceptance testing:
  - one `Master`
  - one `Organization`
  - one `Guardian`
  - one `Patient`
- User passwords must be stored as protected hashes compatible with
  `HashService.verify`.

## Validation Commands

```bash
pnpm install
pnpm prisma:generate
pnpm test:api
pnpm typecheck:api
pnpm build:api
```

`pnpm install` is only needed when the token signing dependency is added.
`pnpm prisma:generate` is only needed if Prisma client state is stale or schema
changes are introduced.

## Manual API Scenarios

Start the API:

```bash
pnpm dev:api
```

### Valid Master Login

```bash
curl -i -X POST http://localhost:3333/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"master@example.com","password":"valid-password"}'
```

Expected:

- HTTP 200
- response contains `accessToken`, `user`, and `context`
- `user.profile` is `Master`
- `context.view` is `BackofficeMaster`
- response does not contain `passwordHash` or password material

### Valid Organization Login

```bash
curl -i -X POST http://localhost:3333/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"operator@example.com","password":"valid-password"}'
```

Expected:

- HTTP 200
- `user.profile` is `Organization`
- `context.view` is `Organization`
- response does not contain `passwordHash` or password material

### Valid Guardian Login

```bash
curl -i -X POST http://localhost:3333/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"guardian@example.com","password":"valid-password"}'
```

Expected:

- HTTP 200
- `user.profile` is `Guardian`
- `context.view` is `PatientPortal`
- `guardianId` is present or null according to the user record
- no managed patient list is returned

### Valid Patient Login

```bash
curl -i -X POST http://localhost:3333/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"patient@example.com","password":"valid-password"}'
```

Expected:

- HTTP 200
- `user.profile` is `Patient`
- `context.view` is `PatientPortal`
- `patientId` is present or null according to the user record

### Unknown Email

```bash
curl -i -X POST http://localhost:3333/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"unknown@example.com","password":"any-password"}'
```

Expected:

- HTTP 401
- generic credential failure
- no indication whether the e-mail exists

### Wrong Password

```bash
curl -i -X POST http://localhost:3333/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"master@example.com","password":"wrong-password"}'
```

Expected:

- HTTP 401
- same generic credential failure as unknown email
- no token returned

### Invalid Payload

```bash
curl -i -X POST http://localhost:3333/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"not-an-email","password":""}'
```

Expected:

- HTTP 400
- structured validation failure
- authentication is not attempted

## Regression Checks

```bash
git diff -- packages/web
```

Expected: no frontend changes.

Also verify implementation did not add:

- cookies
- IronSession
- logout endpoint
- refresh token endpoint
- `/me`
- RBAC
- authorization middleware
- registration
- password recovery

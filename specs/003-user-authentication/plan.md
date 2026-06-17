# Implementation Plan: User Authentication

**Branch**: `feat/authentication` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-user-authentication/spec.md`

## Summary

Build the first authentication slice as login-only end-to-end behavior: shared
auth contracts, API domain/application/persistence for users, password
verification, JWT access and refresh tokens, server-side session control, a web
login flow backed by IronSession cookies, and a reusable authorization marker
that is not applied to existing production endpoints yet. Account registration,
password reset, MFA, SSO, and session management screens stay out of scope.

## Technical Context

**Language/Version**: TypeScript 6.x, Node.js runtime for API, React 19 /
Next.js 16 for web.

**Primary Dependencies**: `packages/web` uses Next.js, React, Tailwind CSS,
React Hook Form, Zod, existing UI primitives, and will add IronSession for
encrypted cookie-backed server sessions. `packages/api` uses Fastify, Prisma,
PostgreSQL, centralized exceptions, and will add argon2id password hashing plus
JWT signing/verification. `packages/shared` remains dependency-light and owns
auth DTOs/enums.

**Storage**: PostgreSQL via Prisma for `User`, `UserSession`, `RefreshToken`,
and `AuthenticationAuditEvent`. Browser authentication state is stored only in
the encrypted IronSession cookie managed by the Next.js server layer.

**Testing**: Vitest for API and web unit/component tests; repository gates are
`pnpm typecheck` and `pnpm build`, with package gates `pnpm test:api`,
`pnpm test:web`, `pnpm typecheck:api`, `pnpm typecheck:web`,
`pnpm build:api`, and `pnpm build:web`. Prisma generation and migration checks
are required because the schema changes.

**Target Platform**: Next.js web app plus Fastify API runtime, with a shared
workspace package consumed by both.

**Project Type**: pnpm monorepo touching `packages/web`, `packages/api`,
`packages/shared`, root/package scripts, Prisma schema/migrations, and feature
documentation.

**Performance Goals**: A valid login should complete in under 2 seconds in the
local development environment. Current-session checks and refresh attempts
should complete quickly enough that reloads and route transitions do not visibly
block normal navigation.

**Constraints**: The feature is login-only. No account registration endpoint or
screen is introduced. Passwords use at least 8 characters, at least one
lowercase letter, and at least one number; symbols and uppercase letters remain
allowed, so `Acesso@123` is valid. User types are exactly `MASTER`,
`ORGANIZATION`, and `STANDARD`. Access and refresh credentials are JWTs. Refresh
tokens are persisted only as hashes and are rotated. IronSession cookies must
not expose tokens to browser JavaScript. Existing endpoints must not receive the
new authorization marker in this feature.

**Scale/Scope**: First authentication slice covers one login screen, API auth
routes, three seeded local test users, session renewal, current session lookup,
logout/current-session invalidation, and the reusable authorization marker.
Self-registration, password reset, role-specific permission matrices, and the
future session management screen are out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: Affected packages are `packages/shared` for auth
  contracts, `packages/api` for auth domain/application/http/persistence,
  `packages/web` for the login/session UI and IronSession server routes, and
  root/package metadata for dependencies, scripts, and Prisma commands. The plan
  uses public package imports only.
- **Shared Contracts**: Shared auth contracts include `UserType`,
  `AuthenticatedUserDto`, `AuthSessionDto`, `LoginRequest`, `LoginResponse`,
  `RefreshSessionRequest`, `RefreshSessionResponse`,
  `CurrentSessionResponse`, `LogoutResponse`, `AuthErrorCode`, and the existing
  shared `ErrorResponseDto`.
- **Tenant Isolation**: `User` carries `organizationId` when an organization or
  standard user is scoped to a tenant. `MASTER` users are explicitly
  platform-scoped. JWT claims, session records, and web session summaries carry
  this same scope so future protected endpoints can enforce tenant boundaries
  from the authenticated context.
- **Clean Layering**: API behavior stays in auth domain models, application use
  cases, repository interfaces, HTTP routes/plugins/decorators, security
  adapters, and Prisma adapters. Web behavior stays under `app/(auth)/entrar`,
  `app/api/auth/*`, `lib/session`, and small request/schema helpers.
  `packages/shared` contains only DTOs/enums and no React, Fastify, Prisma, or
  security implementation.
- **Verifiable Delivery**: US1 is verified by successful and failed login tests,
  password hashing tests, and web form submission tests. US2 is verified by
  current-session and refresh tests plus browser reload validation. US3 is
  verified by logout invalidation tests. US4 is verified by isolated
  authorization marker tests and by regression tests proving existing endpoints
  remain unmarked.

**Gate Status**: PASS. No constitution violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/003-user-authentication/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── authentication.openapi.yaml
│   └── shared-types.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
packages/
├── shared/
│   └── src/
│       ├── authentication.ts
│       └── index.ts
├── api/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── application/
│       │   └── authentication/
│       │       ├── authentication-repository.ts
│       │       ├── get-current-session-use-case.ts
│       │       ├── login-use-case.ts
│       │       ├── logout-use-case.ts
│       │       └── refresh-session-use-case.ts
│       ├── communication/
│       │   └── http/
│       │       ├── decorators/authorization.ts
│       │       ├── plugins/authentication.ts
│       │       └── routes/authentication-routes.ts
│       ├── domain/
│       │   └── authentication/
│       │       ├── authentication-audit-event.ts
│       │       ├── refresh-token.ts
│       │       ├── user-password.ts
│       │       ├── user-session.ts
│       │       └── user.ts
│       └── infrastructure/
│           ├── database/prisma-authentication-repository.ts
│           └── security/
│               ├── argon2-password-hasher.ts
│               ├── jwt-token-service.ts
│               └── refresh-token-hasher.ts
└── web/
    ├── app/
    │   ├── (auth)/
    │   │   └── entrar/
    │   │       ├── login-form.tsx
    │   │       ├── page.tsx
    │   │       ├── requests/sign-in.ts
    │   │       └── schemas/login-schema.ts
    │   └── api/
    │       └── auth/
    │           ├── login/route.ts
    │           ├── logout/route.ts
    │           └── session/route.ts
    └── lib/
        ├── auth-redirects.ts
        ├── http.ts
        └── session.ts
```

**Structure Decision**: Keep the authentication user table focused on login and
session identity, not profile data. Role-specific profile/registration domains
can later point to `User` by id without putting patient, employee, or master
profile fields into the authentication aggregate.

## Complexity Tracking

No constitution violations require justification.

## Post-Design Constitution Check

- **Monorepo Boundaries**: PASS. Shared contracts stay in `packages/shared`, API
  auth behavior stays server-side, and web session handling stays in
  `packages/web`.
- **Shared Contracts**: PASS. Auth DTOs and enums are documented in
  `contracts/shared-types.md` and intended for `packages/shared/src/authentication.ts`.
- **Tenant Isolation**: PASS. User/session/token context carries platform or
  organization scope from login onward, while no existing tenant endpoint is
  protected by the new marker in this feature.
- **Clean Layering**: PASS. Domain password/session rules, application use
  cases, HTTP routes, security adapters, and Prisma adapters remain separated.
- **Verifiable Delivery**: PASS. Quickstart and contracts define API, web,
  persistence, refresh, logout, seed, and authorization-marker validation.

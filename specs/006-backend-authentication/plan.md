# Implementation Plan: Autenticação Backend

**Branch**: `(not set; spec directory 006-backend-authentication)` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-backend-authentication/spec.md`

## Summary

Build an API-only login flow for existing systemic `User` records. The
implementation stays inside `packages/api`, adds an `auth` module with
`AuthenticateUserUseCase`, validates `POST /auth/login` input with Zod at the
HTTP boundary, verifies passwords only through the existing `HashService` port,
introduces a minimal `JwtService` port plus `JoseJwtService` infrastructure
adapter because no JWT service exists yet, and returns a stable login payload
with `accessToken`, public `user`, and derived `context`. The plan explicitly
excludes frontend, cookies, IronSession, logout, refresh token, `/me`, RBAC,
authorization middleware, registration, and password recovery.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js runtime, ES2022 target,
NodeNext module resolution. No explicit Node engine is declared in
`package.json`.

**Primary Dependencies**: `packages/api` uses Fastify 5.8.5, Prisma 6.19.3,
PostgreSQL, Zod 4.4.3, Vitest 4.1.9, and existing shared domain/application
helpers. `argon2` is already isolated behind `Argon2HashService`. No JWT/Jose
dependency or service exists in `packages/api` today, so this feature adds a
JWT service abstraction and a Jose-backed infrastructure implementation.

**Storage**: PostgreSQL through Prisma. `User` is already modeled in
`packages/api/prisma/schema.prisma` with `organizationId`, `email`,
`passwordHashed`, `profile`, optional `guardianId`, and optional `patientId`.
No schema change is expected for login.

**Testing**: Vitest unit tests for `AuthenticateUserUseCase`, auth Zod schemas,
and token service behavior. Existing tests are primarily unit/schema tests under
`src/**/*.test.ts`; there is no current Fastify `buildApp().inject()` route-test
pattern. Add a focused route test only if the auth route can be tested without
a real database by injecting or stubbing the use case factory; otherwise cover
HTTP behavior through schema tests plus a quickstart manual/API scenario.
Package gates are `pnpm test:api`, `pnpm typecheck:api`, and `pnpm build:api`.

**Target Platform**: Fastify API runtime only.

**Project Type**: pnpm monorepo, API-only change in `packages/api` plus feature
documentation under `specs/006-backend-authentication`.

**Performance Goals**: Successful and failed login attempts should complete in
under 2 seconds for at least 95% of acceptance test attempts in a normal
development or staging environment.

**Constraints**: Do not alter `packages/web`. Do not implement cookies,
IronSession, frontend UI, client-side middleware, logout, refresh token, `/me`,
RBAC, authorization middleware, registration, or password recovery. Do not
import Argon2 or Jose directly from use cases or domain code. Do not return
`passwordHash` or reveal whether an email exists.

**Scale/Scope**: One login endpoint, one use case, one request schema, one
response contract, one JWT service port/adapter, one auth route plugin, one app
registration, no persistence migration, no session store, no authorization
policy.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: PASS. Implementation is limited to `packages/api`
  and feature documentation. `packages/web` is intentionally untouched.
  `packages/shared` is not changed because no shared API client contract is
  currently consumed by both packages.
- **Shared Contracts**: PASS. The login request, login response, auth context,
  token payload, and error payloads are documented in
  `contracts/auth-login.openapi.yaml`. TypeScript DTO/read-models stay in
  `packages/api` unless implementation discovers an existing project rule that
  requires promotion to `packages/shared`.
- **Tenant Isolation**: PASS. Login returns only the authenticated user's own
  `organizationId`, `guardianId`, and `patientId`; it does not accept a tenant
  selector and does not read or expose other organization records.
- **Clean Layering**: PASS. Authentication orchestration stays in
  `modules/auth/application/use-cases`; `User` and `UserProfile` stay in
  `modules/users/domain`; `UserRepository` stays in `modules/users/application`;
  password hashing and JWT signing are consumed through shared application
  ports; concrete Argon2/Jose implementations stay in shared infrastructure;
  Zod and Fastify stay in `modules/auth/presentation/http`.
- **Verifiable Delivery**: PASS. User stories are independently testable:
  valid login for Master/Organization/Patient/Guardian, invalid credentials without account
  enumeration, and stable response context. Verification covers schema
  validation, use-case behavior, password verification through `HashService`,
  token signing through `JwtService`, route registration, structured 400/401/500
  behavior, and absence of frontend/cookie/IronSession changes.

## Project Structure

### Documentation (this feature)

```text
specs/006-backend-authentication/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── auth-login.openapi.yaml
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
packages/
└── api/
    ├── package.json
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── config/
        │   └── env.ts
        ├── modules/
        │   ├── auth/
        │   │   ├── application/
        │   │   │   └── use-cases/
        │   │   │       ├── AuthenticateUserUseCase.ts
        │   │   │       └── AuthenticateUserUseCase.test.ts
        │   │   ├── infrastructure/
        │   │   │   └── create-auth-use-cases.factory.ts
        │   │   └── presentation/http/
        │   │       ├── auth-presenter.ts
        │   │       ├── auth-routes.ts
        │   │       ├── auth-schemas.ts
        │   │       └── auth-schemas.test.ts
        │   └── users/
        │       ├── application/repositories/UserRepository.ts
        │       ├── domain/
        │       │   ├── entities/User.ts
        │       │   ├── enums/UserProfile.ts
        │       │   └── value-objects/
        │       │       ├── Email.ts
        │       │       └── PasswordHash.ts
        │       └── infrastructure/prisma/
        │           ├── PrismaUserRepository.ts
        │           └── UserMapper.ts
        └── shared/
            ├── application/
            │   ├── cryptography/HashService.ts
            │   ├── errors/
            │   │   ├── AuthenticationError.ts
            │   │   ├── ConflictError.ts
            │   │   └── NotFoundError.ts
            │   └── tokens/JwtService.ts
            ├── infrastructure/
            │   ├── cryptography/Argon2HashService.ts
            │   └── tokens/JoseJwtService.ts
            └── presentation/http/fastify/
                ├── app.ts
                └── plugins/error-handler.ts
```

**Structure Decision**: Add a narrow `modules/auth` API module for login
orchestration and HTTP presentation. Reuse the existing `modules/users`
aggregate, repository port, Prisma repository, `Email` value object,
`PasswordHash` value object, `UserProfile` enum, `HashService` port, and
`Argon2HashService`. Add only the missing token port/adapter and authentication
error mapping needed for `POST /auth/login`.

## Current Architecture Analysis

- **User**: `packages/api/src/modules/users/domain/entities/User.ts`. The entity
  has `organizationId`, `email`, `passwordHash`, `profile`, optional
  `guardianId`, and optional `patientId`. It enforces `organizationId`, Guardian
  users with `guardianId`, and Patient users with both `guardianId` and
  `patientId`.
- **UserProfile**: `packages/api/src/modules/users/domain/enums/UserProfile.ts`.
  Current values for this feature are `Master`, `Organization`, `Patient`, and
  `Guardian`; `Organization` identifies internal organization users without
  adding RBAC in this slice.
- **UserRepository**:
  `packages/api/src/modules/users/application/repositories/UserRepository.ts`.
  It already exposes `findById`, `findByEmail`, `create`, and `save`.
- **PrismaUserRepository**:
  `packages/api/src/modules/users/infrastructure/prisma/PrismaUserRepository.ts`.
  It implements `findByEmail(email: Email)` through Prisma `user.findFirst`
  using normalized `email.value`.
- **HashService**:
  `packages/api/src/shared/application/cryptography/HashService.ts`. It exposes
  `hash(value)` and `verify(hash, value)`.
- **Argon2HashService**:
  `packages/api/src/shared/infrastructure/cryptography/Argon2HashService.ts`.
  It is the only current Argon2 import and returns `false` when verification
  fails or throws.
- **JwtService/JoseJwtService**: Not present in `packages/api/src`. Planning must
  add `shared/application/tokens/JwtService.ts` and
  `shared/infrastructure/tokens/JoseJwtService.ts`, plus any required environment
  configuration and package dependency.
- **Use cases**: Module use cases live under
  `packages/api/src/modules/*/application/use-cases`. Existing use cases accept
  dependencies by constructor and return DTO/read-model outputs.
- **Factories**: Route-facing factories live under each module's
  `infrastructure` folder, for example
  `create-organization-use-cases.factory.ts`; auth should follow this pattern.
- **Fastify routes/handlers**: Route plugins live under
  `modules/*/presentation/http/*-routes.ts`. They validate `request.body`,
  `params`, or `query` with Zod `safeParse`, return local 400 validation
  responses, call use cases, and register JSON schemas for docs/validation.
- **Route registration**:
  `packages/api/src/shared/presentation/http/fastify/app.ts` registers global
  plugins first, then feature route plugins. Auth routes should be registered
  with `await app.register(authRoutes)` alongside existing routes.
- **Error handling**:
  `packages/api/src/shared/presentation/http/fastify/plugins/error-handler.ts`
  maps Fastify validation errors to 400, `DomainValidationError` to 422, other
  `DomainError` to 400, `NotFoundError` to 404, `ConflictError` to 409, and
  unexpected 5xx errors to structured `InternalServerError`. There is no 401
  application error yet.
- **Zod usage**: Zod is used in `config/env.ts`, some older use cases, and
  current HTTP schemas such as `subscription-plan-schemas.ts` and
  `organization-schemas.ts`. New login request validation should follow the
  presentation-boundary pattern used by subscription plans and organizations.
- **Tests**: Current API tests are Vitest unit/schema tests under
  `src/**/*.test.ts`. No existing HTTP route test pattern using Fastify inject
  was found.
- **Prisma schema**: `User` already exists with `@@unique([organizationId,
  email])`, not a global email unique constraint. The current login request does
  not include `organizationId`, so implementation must resolve the duplicate
  email risk before or during tasks if production data can contain the same
  email across organizations.

## Target Architecture

- **Application**: Add `AuthenticateUserUseCase` under
  `modules/auth/application/use-cases`. It receives `UserRepository`,
  `HashService`, and `JwtService`; creates `Email` from input; calls
  `userRepository.findByEmail`; verifies password via `hashService.verify`;
  throws the same `AuthenticationError` for unknown email and wrong password;
  signs the token via `jwtService.sign`; and returns `LoginResponse`.
- **Presentation**: Add `auth-schemas.ts` with Zod login body schema, Fastify
  JSON body schema, login response schema, validation error schema, auth error
  schema, and internal error schema. Add `auth-routes.ts` registering only
  `POST /auth/login`.
- **Presenter**: Add `auth-presenter.ts` only if useful to keep route handlers
  consistent with existing modules; it should map the use-case output directly
  without password material.
- **Infrastructure**: Add `create-auth-use-cases.factory.ts` to instantiate
  `PrismaTransactionManager` or direct Prisma-backed repositories as needed,
  `PrismaUserRepository`, `Argon2HashService`, and `JoseJwtService`.
- **Token service**: Add `JwtService` port in shared application and
  `JoseJwtService` in shared infrastructure. Add required env config such as
  token secret and expiration only in infrastructure/config, not use cases.
- **Errors**: Add an `AuthenticationError` application error and map it to 401
  in the global error handler, or return 401 locally from `auth-routes.ts`.
  Prefer global mapping because credential failures are application-level errors
  and should remain transport-agnostic until presentation translation.
- **Route registration**: Import and register `authRoutes` in `buildApp()`.
- **No scope creep**: Do not touch `packages/web`, do not add browser cookies,
  do not add refresh tokens, do not add `/me`, and do not protect existing
  routes with authorization middleware.

## Files To Create

- `packages/api/src/modules/auth/application/use-cases/AuthenticateUserUseCase.ts`
- `packages/api/src/modules/auth/application/use-cases/AuthenticateUserUseCase.test.ts`
- `packages/api/src/modules/auth/infrastructure/create-auth-use-cases.factory.ts`
- `packages/api/src/modules/auth/presentation/http/auth-presenter.ts`
- `packages/api/src/modules/auth/presentation/http/auth-routes.ts`
- `packages/api/src/modules/auth/presentation/http/auth-schemas.ts`
- `packages/api/src/modules/auth/presentation/http/auth-schemas.test.ts`
- `packages/api/src/shared/application/errors/AuthenticationError.ts`
- `packages/api/src/shared/application/tokens/JwtService.ts`
- `packages/api/src/shared/infrastructure/tokens/JoseJwtService.ts`
- `packages/api/src/shared/infrastructure/tokens/JoseJwtService.test.ts`

## Files To Change

- `packages/api/package.json`: add the token signing dependency if using Jose.
- `packages/api/src/config/env.ts`: add and validate JWT signing configuration
  required by the infrastructure adapter.
- `packages/api/src/shared/presentation/http/fastify/plugins/error-handler.ts`:
  map `AuthenticationError` to 401 with a generic message.
- `packages/api/src/shared/presentation/http/fastify/app.ts`: register
  `authRoutes`.
- `packages/api/prisma/schema.prisma`: no planned change; revisit only if
  planning/tasks decide login by email requires a global unique constraint or
  tenant-aware login input.

## Risks

- **Email uniqueness mismatch**: Prisma currently enforces unique email only per
  `organizationId`, while `POST /auth/login` accepts only email and password.
  If duplicate emails exist across organizations, `findByEmail` may authenticate
  the first matching record. Mitigation: verify product data rules before
  implementation; if duplicates are possible, add a task to enforce global
  email uniqueness or revise login input in a future spec.
- **Missing JWT dependency/config**: There is no existing JWT/Jose service or env
  variable. Mitigation: add explicit token port, adapter, env validation, and
  tests.
- **Error mapping regression**: Adding 401 handling should not alter existing
  400/404/409/422/500 behavior. Mitigation: map only `AuthenticationError`.
- **Route test friction**: Existing tests do not show a Fastify inject pattern.
  Mitigation: prioritize use-case and schema tests; add a focused HTTP test if
  the auth route can be instantiated with stubs without a real database.
- **Sensitive data exposure**: `User` exposes `passwordHash` to application
  code. Mitigation: presenter/use case must explicitly construct public user
  DTOs and never spread domain entity props.

## Implementation Order

1. Add `AuthenticationError` and 401 mapping without changing existing error
   mappings.
2. Add `JwtService` port, `JoseJwtService` adapter, package dependency, and env
   validation for signing configuration.
3. Add `AuthenticateUserUseCase` with in-memory test doubles for
   `UserRepository`, `HashService`, and `JwtService`.
4. Add `auth-schemas.ts` and schema tests for valid body, invalid body, trimming,
   strict object behavior, and response contract shape.
5. Add `auth-presenter.ts` and `auth-routes.ts` for `POST /auth/login`.
6. Add `create-auth-use-cases.factory.ts` wiring `PrismaUserRepository`,
   `Argon2HashService`, and `JoseJwtService`.
7. Register `authRoutes` in `buildApp()`.
8. Add focused HTTP coverage if feasible without database coupling; otherwise
   document manual `POST /auth/login` validation in quickstart and rely on
   use-case/schema tests.
9. Run package validation gates and ensure no frontend files changed.

## Commands de Validação

```bash
pnpm install
pnpm prisma:generate
pnpm test:api
pnpm typecheck:api
pnpm build:api
git diff -- packages/web
```

`pnpm install` is needed only if a new token signing dependency is added.
`pnpm prisma:generate` is only required if generated Prisma client state is
stale or if schema changes are introduced during implementation.

## Post-Design Constitution Check

- **Monorepo Boundaries**: PASS. Design artifacts keep implementation in
  `packages/api`; no web files are part of the target architecture.
- **Shared Contracts**: PASS. `contracts/auth-login.openapi.yaml` documents the
  external API contract; package-local DTOs remain acceptable for this API-only
  slice.
- **Tenant Isolation**: PASS. Data model and contract include only the
  authenticated user's own organization and patient/guardian links.
- **Clean Layering**: PASS. Design keeps Zod/Fastify in presentation, Prisma and
  Jose in infrastructure, and use-case logic behind application ports.
- **Verifiable Delivery**: PASS. Quickstart and test plan cover valid login,
  invalid credentials, invalid payload, response shape, 401 mapping, and no
  frontend/cookie/IronSession changes.

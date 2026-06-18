# Implementation Plan: CRUD de Planos de Assinatura Master

**Branch**: `(not set; spec directory 004-subscription-plan-crud)` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-subscription-plan-crud/spec.md`

## Summary

Build an API-only CRUD for the global backoffice master `SubscriptionPlan`
catalog. The implementation stays inside `packages/api`, reuses the existing
domain entity and `MoneyInCents` value object, expands the subscription-plan
application repository and Prisma adapter, adds application use cases, adds a
Fastify route plugin under `/backoffice/subscription-plans`, validates HTTP
input with Zod at the presentation boundary, and preserves the existing
Organization relationship without adding billing, frontend, authentication, or
authorization middleware work.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js runtime, ES2022 target,
NodeNext module resolution. No explicit Node engine is declared in
`package.json`.

**Primary Dependencies**: `packages/api` uses Fastify 5.8.5, Prisma 6.19.3,
PostgreSQL, Zod 4.4.3, Vitest 4.1.9, and the existing shared domain/application
helpers. `packages/web` and `packages/shared` are not implementation targets for
this feature.

**Storage**: PostgreSQL through Prisma. `SubscriptionPlan` is already modeled in
`packages/api/prisma/schema.prisma` with `title`, `description`,
`priceInCents`, `operatorsLimit`, `patientsLimit`, timestamps, and an existing
relation from `Organization.currentPlanId`.

**Testing**: Vitest unit tests for domain and application use cases, focused
Fastify presentation tests where handlers/schemas can be exercised without a
production database, and package gates `pnpm test:api`, `pnpm typecheck:api`,
`pnpm build:api`, plus Prisma generation when schema changes.

**Target Platform**: Fastify API runtime only.

**Project Type**: pnpm monorepo, API-only change in `packages/api` plus feature
documentation under `specs/004-subscription-plan-crud`.

**Performance Goals**: CRUD operations should complete in under 1 second in a
local development environment for the expected small master catalog. The initial
list endpoint returns all plans and does not introduce pagination or filters.

**Constraints**: Do not promote `SubscriptionPlan` to Aggregate Root. Do not add
billing rules. Do not add new Organization behavior beyond checking the existing
foreign-key relationship before delete. Do not alter authentication. Do not add
a new authorization middleware because no current middleware pattern exists.
Do not touch frontend code. Do not do broad refactors. Money stays as integer
cents.

**Scale/Scope**: One master catalog entity, five HTTP endpoints, no UI, no
shared contracts package changes unless implementation discovers an existing
hard requirement, no search/filter/pagination in v1.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: PASS. The implementation is limited to `packages/api`
  and feature documentation. `packages/web` is untouched. `packages/shared` is
  not changed because this API-only feature has no cross-package consumer yet.
- **Shared Contracts**: PASS. Endpoint payloads and error shapes are documented
  in `contracts/subscription-plans.openapi.yaml`. No DTO, enum, or TypeScript
  interface is promoted to `packages/shared` for this slice.
- **Tenant Isolation**: PASS. `SubscriptionPlan` is a platform-level catalog
  entity and intentionally has no `organizationId`. Tenant-owned operational
  data is not returned. The only Organization interaction is a delete guard
  that checks whether any existing Organization references the plan.
- **Clean Layering**: PASS. Domain rules remain in
  `modules/subscription-plans/domain`; use cases in
  `modules/subscription-plans/application/use-cases`; repository contracts in
  `application/repositories`; Prisma mapper/repository/factory in
  `infrastructure`; Fastify routes, handlers, and Zod request schemas in
  `presentation/http`.
- **Verifiable Delivery**: PASS. User stories are independently testable:
  create, list/get, update, and delete. Verification covers validation,
  cent-based money, not-found/conflict errors, delete-in-use behavior, route
  registration, Prisma persistence, and existing organization-plan lookup
  compatibility.

## Project Structure

### Documentation (this feature)

```text
specs/004-subscription-plan-crud/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── subscription-plans.openapi.yaml
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
packages/
└── api/
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    └── src/
        ├── modules/
        │   ├── organizations/
        │   │   └── application/repositories/OrganizationRepository.ts
        │   └── subscription-plans/
        │       ├── application/
        │       │   ├── repositories/SubscriptionPlanRepository.ts
        │       │   └── use-cases/
        │       │       ├── CreateSubscriptionPlanUseCase.ts
        │       │       ├── DeleteSubscriptionPlanUseCase.ts
        │       │       ├── GetSubscriptionPlanUseCase.ts
        │       │       ├── ListSubscriptionPlansUseCase.ts
        │       │       └── UpdateSubscriptionPlanUseCase.ts
        │       ├── domain/entities/
        │       │   └── SubscriptionPlan.ts
        │       ├── infrastructure/
        │       │   ├── create-subscription-plan-use-cases.factory.ts
        │       │   └── prisma/
        │       │       ├── PrismaSubscriptionPlanRepository.ts
        │       │       └── SubscriptionPlanMapper.ts
        │       └── presentation/http/
        │           ├── subscription-plan-presenter.ts
        │           ├── subscription-plan-routes.ts
        │           └── subscription-plan-schemas.ts
        ├── shared/
        │   ├── application/errors/
        │   │   ├── ConflictError.ts
        │   │   └── NotFoundError.ts
        │   ├── domain/value-objects/MoneyInCents.ts
        │   └── presentation/http/fastify/
        │       ├── app.ts
        │       └── plugins/error-handler.ts
        └── types/fastify.d.ts
```

**Structure Decision**: Keep the new feature inside the existing
`modules/subscription-plans` module. Add only the missing application use cases,
Prisma repository methods, presentation route plugin, and narrow shared error
mapping needed to expose structured 404/409 responses. Do not introduce a new
package, frontend route, authorization middleware, billing module, or aggregate.

## Current Architecture Analysis

- **Domain modules**: `packages/api/src/modules/*/domain` contains entities,
  enums, and value objects per domain. `SubscriptionPlan` already exists in
  `packages/api/src/modules/subscription-plans/domain/entities/SubscriptionPlan.ts`
  and extends `Entity`, not `AggregateRoot`.
- **Use cases**: `packages/api/src/modules/*/application/use-cases` contains
  orchestration classes such as `CreateOrganizationUseCase` and
  `CreatePatientRegistrationUseCase`. `subscription-plans` currently has no use
  cases.
- **Repositories**: Application repository ports live in
  `packages/api/src/modules/*/application/repositories`. The current
  `SubscriptionPlanRepository` only has `findById`, because Organization
  creation only needs plan lookup.
- **Prisma repositories**: Infrastructure adapters live in
  `packages/api/src/modules/*/infrastructure/prisma`. The current
  `PrismaSubscriptionPlanRepository` implements only `findById`.
- **Prisma mappers**: Mappers live beside Prisma repositories, for example
  `SubscriptionPlanMapper.ts`, `OrganizationMapper.ts`, and `AddressMapper.ts`.
  `SubscriptionPlanMapper` already maps `priceInCents` to `MoneyInCents`.
- **Fastify routes/controllers**: The current Fastify app is assembled in
  `packages/api/src/shared/presentation/http/fastify/app.ts`. Only
  `healthRoute` is registered today. There is no module-specific route pattern
  yet, so this feature should introduce a narrow route plugin under the
  subscription-plan module and register it in `app.ts`.
- **Error handling**: The global error plugin maps `DomainValidationError` to
  422, other `DomainError` instances to 400, and errors with `statusCode` to
  that status. Current `NotFoundError` and `ConflictError` do not carry
  `statusCode`, so the implementation must add explicit mapping in the error
  handler or status fields to avoid returning 500 for application errors.
- **Zod usage**: Zod is used in `config/env.ts` and inside existing application
  use cases. This feature should follow the spec and validate HTTP request
  params/bodies in the presentation layer with `safeParse`, returning 400 for
  invalid route input instead of letting `ZodError` reach the global handler.
- **Prisma schema**: `SubscriptionPlan` already has `id`, `title`,
  `description`, `priceInCents`, `operatorsLimit`, `patientsLimit`, timestamps,
  and `organizations Organization[]`. However `description` is currently
  declared as required while the domain/spec treat it as optional, so schema and
  migration work are needed.
- **MoneyInCents**: `MoneyInCents` already exists in
  `packages/api/src/shared/domain/value-objects/MoneyInCents.ts`, accepts zero
  and positive integers, and rejects floats and negative values. It must be
  reused rather than creating a new money type.

## Target Architecture

- **Domain**: Keep `SubscriptionPlan` as an `Entity` with title trimming,
  optional description, `MoneyInCents`, and positive integer limits. Add only
  focused tests/adjustments required by the spec.
- **Application**: Add five use cases: create, list, get by ID, update, and
  delete. Use cases construct/update domain entities, call repository ports,
  return application DTOs, and throw `NotFoundError`/`ConflictError` for
  not-found and delete-in-use cases.
- **Repository port**: Expand `SubscriptionPlanRepository` to support CRUD plus
  a delete guard. Keep `findById(id): Promise<SubscriptionPlan | null>` for
  existing Organization compatibility, and add methods that return a persisted
  read model with timestamps for API responses.
- **Infrastructure**: Extend `PrismaSubscriptionPlanRepository` and
  `SubscriptionPlanMapper`. Use Prisma `create`, `findMany`, `findUnique`,
  `update`, `delete`, and an Organization reference count or existence query to
  guard deletion.
- **Presentation**: Add Fastify routes under `/backoffice/subscription-plans`.
  Route schemas use Zod for params/body validation and pass typed input to use
  cases. The route file wires use cases through a module factory using
  `app.prisma`.
- **Errors**: Preserve the global structured error shape `{ error, message }`.
  Add 404/409 handling for application errors and route-local 400 responses for
  invalid params/bodies.
- **Prisma schema**: Make `SubscriptionPlan.description` nullable (`String?`)
  to match the domain and API contract. Do not add Organization fields or
  billing fields.
- **Authorization**: Do not add auth changes. The route namespace is the master
  context for this slice. Do not implement authorization, permission middleware,
  or Master profile validation in this feature.

## Files To Create

- `packages/api/src/modules/subscription-plans/application/use-cases/CreateSubscriptionPlanUseCase.ts`
- `packages/api/src/modules/subscription-plans/application/use-cases/CreateSubscriptionPlanUseCase.test.ts`
- `packages/api/src/modules/subscription-plans/application/use-cases/ListSubscriptionPlansUseCase.ts`
- `packages/api/src/modules/subscription-plans/application/use-cases/ListSubscriptionPlansUseCase.test.ts`
- `packages/api/src/modules/subscription-plans/application/use-cases/GetSubscriptionPlanUseCase.ts`
- `packages/api/src/modules/subscription-plans/application/use-cases/GetSubscriptionPlanUseCase.test.ts`
- `packages/api/src/modules/subscription-plans/application/use-cases/UpdateSubscriptionPlanUseCase.ts`
- `packages/api/src/modules/subscription-plans/application/use-cases/UpdateSubscriptionPlanUseCase.test.ts`
- `packages/api/src/modules/subscription-plans/application/use-cases/DeleteSubscriptionPlanUseCase.ts`
- `packages/api/src/modules/subscription-plans/application/use-cases/DeleteSubscriptionPlanUseCase.test.ts`
- `packages/api/src/modules/subscription-plans/infrastructure/create-subscription-plan-use-cases.factory.ts`
- `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-routes.ts`
- `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-schemas.ts`
- `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-presenter.ts`
- `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-routes.test.ts` if route tests can run without a real production database.
- A Prisma migration under `packages/api/prisma/migrations/` if `description`
  needs to become nullable in the checked-in schema state.

## Files To Modify

- `packages/api/src/modules/subscription-plans/domain/entities/SubscriptionPlan.ts`
- `packages/api/src/modules/subscription-plans/domain/entities/SubscriptionPlan.test.ts`
- `packages/api/src/modules/subscription-plans/application/repositories/SubscriptionPlanRepository.ts`
- `packages/api/src/modules/subscription-plans/infrastructure/prisma/SubscriptionPlanMapper.ts`
- `packages/api/src/modules/subscription-plans/infrastructure/prisma/PrismaSubscriptionPlanRepository.ts`
- `packages/api/prisma/schema.prisma`
- `packages/api/src/shared/presentation/http/fastify/app.ts`
- `packages/api/src/shared/presentation/http/fastify/plugins/error-handler.ts`
- `packages/api/src/shared/application/errors/ConflictError.ts` or
  `packages/api/src/shared/application/errors/NotFoundError.ts` only if the
  chosen error mapping uses status fields instead of explicit plugin mapping.
- Existing generated Prisma migration files only if they are still unapplied and
  are confirmed to be safe to correct before a new migration is created.

## Incremental Implementation Order

1. Validate and adjust the `SubscriptionPlan` domain entity and tests: optional
   description, text trimming, integer cent money through `MoneyInCents`, and
   positive integer limits. Keep it as `Entity`.
2. Add application DTO/read-model types for plan responses so timestamps do not
   need to become domain invariants.
3. Expand `SubscriptionPlanRepository` with CRUD/read-model operations and an
   in-use check while preserving existing `findById` for Organization creation.
4. Create use cases for create, list, get, update, and delete with focused
   unit tests and in-memory repository fakes.
5. Extend `SubscriptionPlanMapper` and `PrismaSubscriptionPlanRepository` for
   create/list/get/update/delete and Organization reference checks.
6. Adjust Prisma schema/migration only if necessary, primarily making
   `description` nullable to align with the domain and API contract.
7. Add Fastify presentation schemas with Zod for body and params validation.
8. Add Fastify handlers/routes and presenter mapping for response payloads.
9. Register the route plugin in `shared/presentation/http/fastify/app.ts`.
10. Add presentation tests where practical, then run lint/typecheck/tests and
    Prisma generation.

## Risks

- **Auth-context mismatch**: The spec identifies the resource as backoffice
  master, but this slice intentionally treats `/backoffice` only as a technical
  namespace. Mitigation: expose only `/backoffice/...` routes now and defer
  actual role enforcement to a later authentication/authorization feature.
- **Schema mismatch**: Current `schema.prisma` marks `description` required,
  while domain/spec make it optional. Mitigation: plan a nullable schema change
  and check migration state before editing an existing migration.
- **Application error status**: `NotFoundError` and `ConflictError` currently
  lack HTTP status handling. Mitigation: add narrow centralized mapping to keep
  structured API errors.
- **ZodError handling**: Existing global handler does not map Zod errors.
  Mitigation: use `safeParse` in routes and return 400 locally for invalid HTTP
  input.
- **Delete in use**: Organization foreign keys already restrict deletes, but a
  raw Prisma error would be less clear. Mitigation: check Organization usage
  before delete and throw `ConflictError`.
- **Route-test database dependency**: No existing module route tests are present.
  Mitigation: keep tests focused on domain/application and add presentation
  tests with stubs if route wiring can be isolated cleanly.

## Rollback Strategy

- Remove the subscription-plan route registration from
  `shared/presentation/http/fastify/app.ts` to stop exposing the endpoints.
- Revert new subscription-plan presentation, use case, factory, and test files.
- Revert repository/mapper extensions while preserving the existing `findById`
  method used by Organization creation.
- If a Prisma migration was applied, create a forward rollback migration that
  restores the previous `description` nullability only after confirming no rows
  contain null descriptions.
- Revert error-handler changes only if no other feature depends on correct
  `NotFoundError`/`ConflictError` mapping.
- Run `pnpm prisma:generate`, `pnpm test:api`, `pnpm typecheck:api`, and
  `pnpm build:api` after rollback.

## Validation Commands

```bash
pnpm prisma:generate
pnpm test:api
pnpm typecheck:api
pnpm build:api
pnpm --filter @flora/api lint
pnpm typecheck
pnpm build
```

Manual endpoint validation is documented in [quickstart.md](./quickstart.md).

## Complexity Tracking

No constitution violations require justification. The lack of current
authorization middleware is treated as an explicit scope constraint and risk,
not as a new implementation dependency.

## Post-Design Constitution Check

- **Monorepo Boundaries**: PASS. Design artifacts keep implementation in
  `packages/api`; `packages/web` and `packages/shared` stay untouched.
- **Shared Contracts**: PASS. HTTP contract is documented in
  `contracts/subscription-plans.openapi.yaml`; shared package promotion is out
  of scope for this API-only slice.
- **Tenant Isolation**: PASS. `SubscriptionPlan` remains global to backoffice
  master, has no tenant key, and exposes no tenant operational data.
- **Clean Layering**: PASS. Domain, application, infrastructure, and
  presentation responsibilities are separated with existing repository/mapper
  patterns.
- **Verifiable Delivery**: PASS. Quickstart and contracts define validation for
  CRUD, validation errors, not found, conflict, money in cents, route
  registration, and quality gates.

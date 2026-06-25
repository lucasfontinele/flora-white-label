# Implementation Plan: CRUD de Organizações Master

**Branch**: `(not set; spec directory 005-organization-crud)` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-organization-crud/spec.md`

## Summary

Build an API-only CRUD for the master backoffice `Organization` aggregate. The
implementation stays inside `packages/api`, reuses the existing `Organization`
aggregate root, `Address` entity, `Cnpj` and `Cnae` value objects, and existing
`SubscriptionPlan` lookup. It expands organization/address repository ports and
Prisma adapters, adds list/get/update/delete use cases plus richer create
responses, adds a Fastify route plugin under `/backoffice/organizations`,
validates HTTP input with Zod at the presentation boundary, and preserves the
explicit out-of-scope items: no real authorization, no permission middleware,
no separate address endpoints, no frontend work, and no billing work.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js runtime, ES2022 target,
NodeNext module resolution. No explicit Node engine is declared in
`package.json`.

**Primary Dependencies**: `packages/api` uses Fastify 5.8.5, Prisma 6.19.3,
PostgreSQL, Zod 4.4.3, Vitest 4.1.9, and existing shared domain/application
helpers. `packages/web` is not an implementation target for this feature.

**Storage**: PostgreSQL through Prisma. `Organization`, `Address`, and
`SubscriptionPlan` are already modeled in `packages/api/prisma/schema.prisma`.
`Organization.currentPlanId` references `SubscriptionPlan.id`, and
`Organization.addressId` references `Address.id`.

**Testing**: Vitest unit tests for value objects/domain and application use
cases; Zod schema tests for presentation request validation; focused Fastify
route tests only if an HTTP integration pattern is introduced during
implementation. Package gates are `pnpm test:api`, `pnpm typecheck:api`,
`pnpm build:api`, plus Prisma generation when schema/client types change.

**Target Platform**: Fastify API runtime only.

**Project Type**: pnpm monorepo, API-only change in `packages/api` plus feature
documentation under `specs/005-organization-crud`.

**Performance Goals**: CRUD operations should complete in under 1 second in a
local development environment for the expected initial master organization
catalog. The first list endpoint returns all organizations and does not add
pagination, filtering, or ordering controls.

**Constraints**: `Organization` remains Aggregate Root. `Address` remains a
persistable Entity, not an Aggregate Root. `SubscriptionPlan` is reused, not
recreated. Do not implement authorization, permission middleware, separate
address endpoints, frontend changes, billing, payment gateway, plan seed, logo
upload, or broad refactors outside this slice.

**Scale/Scope**: One aggregate CRUD, five HTTP endpoints, one nested address
write model, current plan summary in responses, no UI, no auth changes, no
tenant operational records, no list pagination in v1.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: PASS. Implementation is limited to `packages/api`
  and feature documentation. `packages/web` is intentionally untouched.
  `packages/shared` is not changed because no shared API client contract is in
  use for this API-only slice.
- **Shared Contracts**: PASS. Request/response/error payloads are documented in
  `contracts/organizations.openapi.yaml`. TypeScript DTO/read-models stay in
  `packages/api` unless implementation discovers an existing hard requirement
  to promote API contracts to `packages/shared`.
- **Tenant Isolation**: PASS. `Organization` is the tenant root being managed by
  the master catalog, so this CRUD is global and not filtered by
  `organizationId`. Responses include only organization registration data,
  address, and current plan summary; patients, guardians, users, branding,
  settings, and other tenant operational data stay out of scope.
- **Clean Layering**: PASS. Domain rules remain in `domain`; use cases in
  `application/use-cases`; repository ports in `application/repositories`;
  Prisma mappers/repositories and factories in `infrastructure`; Fastify routes,
  presenters, and Zod schemas in `presentation/http`.
- **Verifiable Delivery**: PASS. User stories are independently testable:
  create with address, list/get, full update, and delete. Verification covers
  CNPJ/CNAE/CEP/UF validation, CNPJ uniqueness, plan lookup, atomic
  organization/address writes, error mapping, route registration, and absence of
  authorization requirements in this slice.

## Project Structure

### Documentation (this feature)

```text
specs/005-organization-crud/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── organizations.openapi.yaml
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
        │   ├── addresses/
        │   │   ├── application/repositories/AddressRepository.ts
        │   │   ├── domain/
        │   │   │   ├── brazilian-states.ts
        │   │   │   └── entities/Address.ts
        │   │   └── infrastructure/prisma/
        │   │       ├── AddressMapper.ts
        │   │       └── PrismaAddressRepository.ts
        │   ├── organizations/
        │   │   ├── application/
        │   │   │   ├── repositories/OrganizationRepository.ts
        │   │   │   └── use-cases/
        │   │   │       ├── CreateOrganizationUseCase.ts
        │   │   │       ├── DeleteOrganizationUseCase.ts
        │   │   │       ├── GetOrganizationByIdUseCase.ts
        │   │   │       ├── ListOrganizationsUseCase.ts
        │   │   │       └── UpdateOrganizationUseCase.ts
        │   │   ├── domain/
        │   │   │   ├── entities/Organization.ts
        │   │   │   └── value-objects/
        │   │   │       ├── Cnae.ts
        │   │   │       └── Cnpj.ts
        │   │   ├── infrastructure/
        │   │   │   ├── create-organization-use-cases.factory.ts
        │   │   │   └── prisma/
        │   │   │       ├── OrganizationMapper.ts
        │   │   │       └── PrismaOrganizationRepository.ts
        │   │   └── presentation/http/
        │   │       ├── organization-presenter.ts
        │   │       ├── organization-routes.ts
        │   │       └── organization-schemas.ts
        │   └── subscription-plans/
        │       ├── application/repositories/SubscriptionPlanRepository.ts
        │       ├── domain/entities/SubscriptionPlan.ts
        │       └── infrastructure/prisma/
        │           ├── PrismaSubscriptionPlanRepository.ts
        │           └── SubscriptionPlanMapper.ts
        └── shared/
            ├── application/errors/
            │   ├── ConflictError.ts
            │   └── NotFoundError.ts
            ├── application/transaction/UnitOfWork.ts
            ├── domain/entities/
            │   ├── AggregateRoot.ts
            │   └── Entity.ts
            └── presentation/http/fastify/
                ├── app.ts
                └── plugins/error-handler.ts
```

**Structure Decision**: Keep the feature inside existing API modules. Reuse
`addresses` for the persistable address entity/repository, reuse
`subscription-plans` for current-plan lookup/read summaries, and add only the
missing CRUD use cases plus `organizations/presentation/http` route surface.

## Current Architecture Analysis

- **Domain modules**: Domain code lives under
  `packages/api/src/modules/*/domain`. Shared base classes live in
  `packages/api/src/shared/domain/entities`. `Organization` already extends
  `AggregateRoot`; `Address` and `SubscriptionPlan` extend `Entity`.
- **Use cases**: Use cases live under
  `packages/api/src/modules/*/application/use-cases`. Organizations currently
  have only `CreateOrganizationUseCase`; subscription plans already have
  create/list/get/update/delete use cases.
- **Repositories**: Application repository ports live under
  `packages/api/src/modules/*/application/repositories`. `OrganizationRepository`
  currently supports only `findByCnpj` and `create`. `AddressRepository`
  supports only `create`. `SubscriptionPlanRepository` already supports
  `findById`, details reads, create/save/delete, and `hasOrganizations`.
- **Prisma mappers**: Mappers live under
  `packages/api/src/modules/*/infrastructure/prisma`. Existing
  `OrganizationMapper`, `AddressMapper`, and `SubscriptionPlanMapper` map Prisma
  records into domain entities and persistence inputs.
- **Prisma repositories**: Prisma repositories live beside mappers and depend on
  `TransactionalPrisma` from `PrismaTransactionManager`, so calls inside a use
  case unit of work share the same transaction client.
- **Fastify routes/handlers**: Route plugins live under module
  `presentation/http` folders. `subscription-plan-routes.ts` defines route
  handlers and is registered from
  `packages/api/src/shared/presentation/http/fastify/app.ts`. There is no
  organization route plugin yet.
- **Error handling**: Global error handling lives in
  `shared/presentation/http/fastify/plugins/error-handler.ts`. Fastify schema
  errors map to 400, `DomainValidationError` maps to 422, other `DomainError`
  maps to 400, `NotFoundError` maps to 404, `ConflictError` maps to 409, and
  unexpected 5xx errors are logged and returned as structured
  `InternalServerError`.
- **Zod usage**: Zod is used in `config/env.ts`, historically in
  `CreateOrganizationUseCase`, and currently at the presentation boundary for
  subscription plan request bodies/params using `safeParse` plus strict schemas.
  New organization HTTP input should follow the subscription-plan presentation
  pattern.
- **SubscriptionPlan implementation**: `SubscriptionPlan` is an independent
  Entity with `title`, optional `description`, `MoneyInCents`, limits, and
  `unlimitedOperators`. Its repository has the `findById` method needed by
  organization creation and can provide read details for current-plan response
  summaries.
- **Cnpj/Cnae/Address/Organization existence**: `Cnpj` exists and validates
  masked/unmasked input through official check digits after normalization.
  `Cnae` exists and validates exactly 7 normalized digits. `Address` exists as
  a persistable Entity and normalizes CEP/state. `Organization` exists as
  Aggregate Root and validates names, `currentPlanId`, and `addressId`.
- **Prisma schema**: `schema.prisma` already models `Organization`, `Address`,
  `SubscriptionPlan`, and `OrganizationSettings`. `organizations.cnpj` is
  unique; `secondaryCnaes` is `String[]`; `currentPlanId` and `addressId` are
  required relations. No schema change is expected unless implementation finds
  migration drift or missing cascade behavior for the chosen delete strategy.

## Target Architecture

- **Domain**: Reuse `Cnpj`, `Cnae`, `Address`, `Organization`, and
  `SubscriptionPlan`. Add only narrow validation adjustments/tests if the spec
  reveals gaps, such as enforcing CEP length exactly 8 digits in `Address`.
- **Application**: Keep create orchestration in `CreateOrganizationUseCase`, but
  align input naming with API `currentPlanId` and return a read model suitable
  for HTTP. Add `ListOrganizationsUseCase`, `GetOrganizationByIdUseCase`,
  `UpdateOrganizationUseCase`, and `DeleteOrganizationUseCase`.
- **Repository ports**: Expand `OrganizationRepository` with
  `findById`, `findDetailsById`, `findAllDetails`, `save`, `delete`, and
  `findByCnpjExcludingId` or equivalent duplicate-CNPJ check. Expand
  `AddressRepository` with `save` and delete/removal support if organization
  deletion must remove or disconnect the address.
- **Read models**: Add application read models for organization responses with
  nested address and current-plan summary, including timestamps. Keep persistence
  timestamps out of domain invariants.
- **Infrastructure**: Extend Prisma mappers/repositories to include nested
  reads with `address` and `currentPlan`, full updates inside unit of work, and
  delete behavior that prevents an address orphan from remaining available to
  this resource.
- **Presentation**: Add `organizations/presentation/http` with Zod schemas,
  JSON schemas for Fastify/OpenAPI, presenter, and route plugin. Register the
  route plugin in `buildApp()` after global plugins.
- **Errors**: Reuse global error handler mapping. Route-local validation returns
  400 with `{ error: "ValidationError", message }`; domain validation continues
  to surface as 422 unless a route-level schema catches the invalid payload
  first.
- **Authorization**: Do not add auth changes. The `/backoffice` namespace is the
  only master-context marker for this slice.

## Files To Create

- `packages/api/src/modules/organizations/application/use-cases/ListOrganizationsUseCase.ts`
- `packages/api/src/modules/organizations/application/use-cases/ListOrganizationsUseCase.test.ts`
- `packages/api/src/modules/organizations/application/use-cases/GetOrganizationByIdUseCase.ts`
- `packages/api/src/modules/organizations/application/use-cases/GetOrganizationByIdUseCase.test.ts`
- `packages/api/src/modules/organizations/application/use-cases/UpdateOrganizationUseCase.ts`
- `packages/api/src/modules/organizations/application/use-cases/UpdateOrganizationUseCase.test.ts`
- `packages/api/src/modules/organizations/application/use-cases/DeleteOrganizationUseCase.ts`
- `packages/api/src/modules/organizations/application/use-cases/DeleteOrganizationUseCase.test.ts`
- `packages/api/src/modules/organizations/infrastructure/create-organization-use-cases.factory.ts`
- `packages/api/src/modules/organizations/presentation/http/organization-presenter.ts`
- `packages/api/src/modules/organizations/presentation/http/organization-routes.ts`
- `packages/api/src/modules/organizations/presentation/http/organization-schemas.ts`
- `packages/api/src/modules/organizations/presentation/http/organization-schemas.test.ts`
- `packages/api/src/modules/organizations/presentation/http/organization-routes.test.ts` only if an HTTP integration-test pattern is introduced or can be kept isolated without a real production database.
- `specs/005-organization-crud/contracts/organizations.openapi.yaml`
- `specs/005-organization-crud/research.md`
- `specs/005-organization-crud/data-model.md`
- `specs/005-organization-crud/quickstart.md`

## Files To Modify

- `packages/api/src/modules/addresses/domain/entities/Address.ts` if CEP length
  validation needs tightening to exactly 8 digits.
- `packages/api/src/modules/addresses/application/repositories/AddressRepository.ts`
- `packages/api/src/modules/addresses/infrastructure/prisma/AddressMapper.ts` if update persistence mapping is needed.
- `packages/api/src/modules/addresses/infrastructure/prisma/PrismaAddressRepository.ts`
- `packages/api/src/modules/organizations/domain/entities/Organization.ts` only for narrow update helpers or invariant gaps discovered during implementation.
- `packages/api/src/modules/organizations/domain/entities/Organization.test.ts`
- `packages/api/src/modules/organizations/domain/value-objects/Cnpj.test.ts`
- `packages/api/src/modules/organizations/domain/value-objects/Cnae.test.ts`
- `packages/api/src/modules/organizations/application/repositories/OrganizationRepository.ts`
- `packages/api/src/modules/organizations/application/use-cases/CreateOrganizationUseCase.ts`
- `packages/api/src/modules/organizations/application/use-cases/CreateOrganizationUseCase.test.ts`
- `packages/api/src/modules/organizations/infrastructure/create-organization.factory.ts` or replace usage with the new plural use-case factory.
- `packages/api/src/modules/organizations/infrastructure/prisma/OrganizationMapper.ts`
- `packages/api/src/modules/organizations/infrastructure/prisma/PrismaOrganizationRepository.ts`
- `packages/api/src/modules/subscription-plans/application/repositories/SubscriptionPlanRepository.ts` only if current-plan summary reuse needs a narrower read method.
- `packages/api/src/modules/subscription-plans/infrastructure/prisma/PrismaSubscriptionPlanRepository.ts` only if needed for current-plan summary reuse.
- `packages/api/src/shared/presentation/http/fastify/app.ts`
- `packages/api/prisma/schema.prisma` only if delete behavior or migration drift requires a schema adjustment.
- `AGENTS.md`

## Risks

- **Delete semantics**: The spec allows physical or logical removal as long as
  removed organizations disappear from CRUD reads. The current schema has no
  soft-delete fields. Physical delete may be blocked later by tenant-owned
  records; implementation must check existing relations before choosing the
  deletion approach.
- **Address orphan handling**: `Address` is persistable and may be referenced by
  future models. For this CRUD, deleting an organization should not leave its
  address visible as an orphan. The plan should remove the address in the same
  unit of work when no other reference exists.
- **CEP validation gap**: Current `Address.create` strips non-digits but only
  checks non-empty. The spec requires exactly 8 digits, so this is a likely
  domain adjustment.
- **CNPJ example/test data**: Tests must use CNPJs that pass existing
  check-digit validation. Values copied from generic examples may fail.
- **HTTP integration tests**: The API package currently has schema/use-case
  tests but no established Fastify `inject` integration suite. Route tests
  should be added only if they can be isolated cleanly.
- **Prisma migrations**: The schema already contains required models. If no
  schema changes are needed, do not create migrations. If delete behavior needs
  relation changes, generate a narrow migration.

## Implementation Order

1. Review and tighten `Cnpj`/`Cnae` tests only where gaps exist; reuse the
   current value objects.
2. Review `Address` validation and add exact 8-digit CEP enforcement plus tests
   if missing.
3. Review `Organization` aggregate invariants and add only narrow update/test
   support if needed.
4. Verify Prisma schema and migrations for `organizations`, `addresses`, and
   `subscription_plans`; avoid schema changes unless required.
5. Expand repository interfaces for organization CRUD, nested read models,
   duplicate CNPJ checks, and address update/delete.
6. Adjust create use case to use `currentPlanId` input and return the full
   organization read model.
7. Add list/get/update/delete organization use cases with focused tests.
8. Extend `OrganizationMapper` and `AddressMapper` for read/update persistence
   needs.
9. Extend Prisma repositories for nested reads, full update, duplicate checks,
   and atomic delete/address cleanup.
10. Create Zod request/params schemas and matching Fastify JSON schemas.
11. Create presenter and Fastify route plugin for the five endpoints.
12. Register organization routes in `buildApp()`.
13. Add unit tests for value-object/domain/use-case behavior and schema tests.
14. Add HTTP integration tests if a clean Fastify test pattern is established.
15. Run Prisma generation if generated client types changed, then run API tests,
   typecheck, build, and lint.

## Rollback Strategy

- Revert route registration in `app.ts` first to remove the public HTTP surface.
- Revert organization presentation files and schema tests next.
- Revert new use cases and repository interface expansions together, because
  repository contracts and implementations must stay in sync.
- Revert Prisma repository/mapper changes after application code no longer
  calls the new methods.
- Revert any Prisma schema/migration only if it has not been applied to shared
  environments; if applied, create a forward migration instead of editing
  history.
- Existing `Cnpj`, `Cnae`, `Address`, `Organization`, and `SubscriptionPlan`
  behavior should remain compatible with the earlier organization-registration
  slice.

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

Run `pnpm prisma:migrate` only if implementation changes
`packages/api/prisma/schema.prisma`.

## Complexity Tracking

No constitution violations are planned. The feature stays in the existing API
package and follows existing module boundaries.

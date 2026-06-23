# Implementation Plan: Controle Backend de Estoque de Produtos da Organizacao

**Branch**: `(not set; spec directory 011-organization-product-inventory)` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-organization-product-inventory/spec.md`

## Summary

Build an API-only backend slice for organization-owned product inventory. The feature introduces a new `inventory` bounded module in `packages/api` with `InventoryItem` as an Aggregate Root, `InventoryMovement` as an append-only audit Entity inside the aggregate boundary, an `InventoryMovementType` enum, a reusable `Quantity` value object, Prisma persistence, application use cases, Fastify routes, Zod validation, OpenAPI contract documentation, and focused tests.

The slice deliberately stops at stock position and movement auditing for a single product/organization. It does not implement frontend, orders, order-bound reservations, prescriptions, checkout, payment, upload, images, batch/lot, expiration, multiple stocks per product, transfers between stocks, RBAC, or authorization middleware. It also never mutates `Product` data: it only reads product existence to scope and validate inventory operations.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js runtime, ES2022 target, NodeNext module resolution. No explicit Node engine is declared.

**Primary Dependencies**: `packages/api` uses Fastify 5.8.5, Prisma 6.19.3, PostgreSQL, Zod 4.4.3, Vitest 4.1.9, shared domain/application helpers, and an existing pnpm monorepo layout.

**Storage**: PostgreSQL through Prisma. Inventory data is persisted in two new Prisma models, `InventoryItem` and `InventoryMovement`, related to `Organization` and `Product`; no file/object storage is used.

**Testing**: Vitest unit tests for domain invariants, use cases with in-memory fakes, schema tests for Zod payloads/params, and optional Fastify inject tests only if route-level patterns already support them cleanly. Validation gates: `pnpm prisma:generate`, `pnpm typecheck:api`, `pnpm --filter @flora/api lint`, `pnpm test:api`, and `pnpm build:api`.

**Target Platform**: Fastify API runtime only.

**Project Type**: pnpm monorepo, API-only change under `packages/api` plus feature documentation under `specs/011-organization-product-inventory`.

**Performance Goals**: 95% of inventory create/get/add-stock/reserve/release/confirm/adjust operations should complete in under 1 second in development/homologation for normal catalog sizes. Movement history should return at least 1,000 movements per product without cross-tenant leakage in under 2 seconds in local validation conditions.

**Constraints**: Do not alter `packages/web`. Do not implement orders, order-bound reservations, prescriptions, checkout, payment, images/uploads, batch/lot, expiration, multiple stocks per product, stock transfers, permission middleware, or unrelated refactors. Inventory must never write to `Product`. Domain must not depend on Prisma, Fastify, Zod, HTTP, or persistence adapters. Application must depend on repository interfaces, not Prisma, and supply `createdByUserId` when building movements.

**Scale/Scope**: One new API module, one movement enum, one shared `Quantity` value object, one aggregate root, one audit entity, one repository interface with read models, two Prisma mappers, one Prisma repository, eight use cases, one presenter, one Zod schema file, one Fastify route file, one composition factory, two Prisma models plus one enum and one migration, route registration, OpenAPI contract, and focused tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: PASS. Implementation is limited to `packages/api`, `packages/api/prisma`, and feature documentation. `packages/web` remains untouched. No package imports private internals across package boundaries.
- **Shared Contracts**: PASS. Inventory payloads, responses, the movement enum, route shapes, and structured error responses are documented in `contracts/organization-product-inventory.openapi.yaml`. Types remain package-local because no frontend/shared consumer is implemented in this backend-only slice.
- **Tenant Isolation**: PASS. `InventoryItem` and `InventoryMovement` carry mandatory `organizationId`. Every route includes `:organizationId` and `:productId`; repositories must query by `{ organizationId, productId }`. Cross-organization access returns not found.
- **Clean Layering**: PASS. Domain owns inventory invariants, movement generation, and `Quantity`. Application owns use-case orchestration, product existence checks through interfaces, and `createdByUserId` stamping. Infrastructure owns Prisma schema, mappers, and repository. Presentation owns Fastify routes, Zod parsing, JSON schema, and HTTP response translation.
- **Verifiable Delivery**: PASS. User stories are independently testable: create position, read position/history, add stock, reserve/release, confirm stock-out, adjust. Verification covers tenant isolation, quantity invariants, reserve limits, append-only movements, atomic persistence, and absence of order/prescription/batch/expiration/upload/payment behavior.

## Project Structure

### Documentation (this feature)

```text
specs/011-organization-product-inventory/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── organization-product-inventory.openapi.yaml
├── checklists/
│   ├── requirements.md
│   └── critical-readiness.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/
└── api/
    ├── package.json
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    │       └── <timestamp>_organization_product_inventory/
    │           └── migration.sql
    └── src/
        ├── shared/
        │   ├── application/
        │   │   ├── errors/
        │   │   └── transaction/
        │   ├── domain/
        │   │   ├── entities/
        │   │   ├── errors/
        │   │   └── value-objects/
        │   │       └── Quantity.ts            # new shared value object
        │   ├── infrastructure/database/prisma/
        │   └── presentation/http/fastify/
        │       └── app.ts
        └── modules/
            ├── products/
            │   └── application/repositories/ProductRepository.ts   # reused for product existence
            └── inventory/
                ├── application/
                │   ├── repositories/
                │   │   └── InventoryRepository.ts
                │   └── use-cases/
                │       ├── CreateInventoryItemUseCase.ts
                │       ├── GetInventoryItemUseCase.ts
                │       ├── AddStockUseCase.ts
                │       ├── ReserveStockUseCase.ts
                │       ├── ReleaseReservationUseCase.ts
                │       ├── ConfirmStockOutUseCase.ts
                │       ├── AdjustStockUseCase.ts
                │       ├── ListInventoryMovementsUseCase.ts
                │       └── *.test.ts
                ├── domain/
                │   ├── entities/
                │   │   ├── InventoryItem.ts
                │   │   ├── InventoryItem.test.ts
                │   │   ├── InventoryMovement.ts
                │   │   └── InventoryMovement.test.ts
                │   └── enums/
                │       └── InventoryMovementType.ts
                ├── infrastructure/
                │   ├── create-inventory-use-cases.factory.ts
                │   └── prisma/
                │       ├── InventoryItemMapper.ts
                │       ├── InventoryMovementMapper.ts
                │       └── PrismaInventoryRepository.ts
                └── presentation/http/
                    ├── inventory-presenter.ts
                    ├── inventory-routes.ts
                    ├── inventory-schemas.test.ts
                    └── inventory-schemas.ts
```

**Structure Decision**: Create a new `modules/inventory` bounded module because stock position and movements are their own domain concept and must not be nested under products. Reuse `shared/application/errors/*`, `PrismaTransactionManager`/`UnitOfWork`, the existing `ProductRepository`/`PrismaProductRepository` for product existence checks, and the existing global error handler. Introduce `Quantity` in `shared/domain/value-objects` because quantities are a generic primitive analogous to `MoneyInCents`.

## Current Architecture Analysis

- **Domain modules**: Current modules live under `packages/api/src/modules/<module>/domain`, usually with `entities/`, `enums/`, and sometimes `value-objects/`. Shared base classes live in `packages/api/src/shared/domain/entities`. `AggregateRoot` and `Entity` both exist; `InventoryItem` should extend `AggregateRoot` and `InventoryMovement` should extend `Entity`.
- **Value objects**: `packages/api/src/shared/domain/value-objects/MoneyInCents.ts` enforces integer, nonnegative cents and is the precedent for `Quantity`. `ValueObject` base freezes props and compares by structural equality. No `Quantity` value object exists today.
- **Append-only audit precedent**: `OrganizationDocumentApprovalLog` is an `Entity` audit record that stores the actor as a plain `organizationUserId` string without a Prisma relation. `InventoryMovement` should follow this pattern for `createdByUserId` (plain string, no FK relation).
- **Use cases**: Application use cases live in `packages/api/src/modules/<module>/application/use-cases`. They receive repository interfaces and `UnitOfWork` through constructors. Write operations run inside `PrismaTransactionManager.execute`.
- **Repositories**: Application repository interfaces live in `packages/api/src/modules/<module>/application/repositories` and define both domain-returning methods (for mutation) and read models (for response queries). Item reads are scoped by `{ organizationId, ... }`.
- **Prisma mappers/repositories**: Mappers and Prisma repositories live under `infrastructure/prisma`. Repositories take `TransactionalPrisma` and call `this.prisma.getClient()` so they work inside and outside transactions.
- **Factories/composition roots**: Module factories live in `infrastructure/create-*-use-cases.factory.ts` and instantiate `PrismaTransactionManager`, repositories, and use cases.
- **Fastify handlers/routes**: Routes live in `presentation/http/*-routes.ts`, register routes on `FastifyInstance`, instantiate use cases via the module factory, parse params/body with Zod `safeParse`, return local `400 ValidationError` on parse failure, and use presenters for response formatting.
- **Error handling**: Domain/application errors bubble to the global handler in `shared/presentation/http/fastify/plugins/error-handler.ts`: `DomainValidationError` -> 422, `DomainError` -> 400, `NotFoundError` -> 404, `ConflictError` -> 409, `ForbiddenError` -> 403, `AuthenticationError` -> 401, unknown 5xx returns `InternalServerError`.
- **Product presence**: The `products` module, `Product` Prisma model, and `ProductRepository.findByIdInOrganization` already exist. Inventory reuses them for organization-scoped product existence checks. No inventory model, enum, route, or `Quantity` exists today.

## Target Architecture

1. **Quantity value object**: Add `shared/domain/value-objects/Quantity.ts` enforcing integer, nonnegative values via `DomainValidationError`, mirroring `MoneyInCents`. Expose `value` and a `create(value)` factory. Add a `Quantity.test.ts`.
2. **Movement enum**: Add `InventoryMovementType` with `IN`, `OUT`, `RESERVE`, `RELEASE`, `ADJUSTMENT`.
3. **InventoryMovement entity**: Add `InventoryMovement extends Entity` with `create(props, id?)` validating non-blank `organizationId`/`inventoryItemId`/`productId`/`createdByUserId`, valid `type`, nonnegative `Quantity`, normalized optional `reason`. `createdAt` is set by persistence and surfaced via read model.
4. **InventoryItem aggregate**: Add `InventoryItem extends AggregateRoot` with factory `create(props, id?)` and behavior methods `addStock`, `reserve`, `releaseReservation`, `confirmStockOut`, `adjustStock`. Each method validates invariants, mutates quantities, and buffers an `InventoryMovementDraft { type, quantity, reason }`. The aggregate exposes `pullMovements()` returning and clearing buffered drafts (mirrors `pullDomainEvents`). Creation with an initial available quantity buffers an opening `IN` draft.
5. **Repository contract**: Add `InventoryRepository` with `findItemByProductInOrganization` (domain), `findItemDetailsByProductInOrganization` (read model), `existsForProduct`, `createItem`, `saveItem`, `appendMovements`, and `listMovementsByProductInOrganization`. Define `InventoryItemReadModel` (with derived `belowMinimum`) and `InventoryMovementReadModel`.
6. **Prisma mappers/repository**: Add `InventoryItemMapper` and `InventoryMovementMapper` translating Prisma rows to domain/read models and domain to persistence inputs. Add `PrismaInventoryRepository` implementing the contract over `TransactionalPrisma`, scoping all reads by `{ organizationId, productId }`.
7. **Use cases** (each runs in `UnitOfWork`, validates product existence via `ProductRepository.findByIdInOrganization`, loads the item, mutates it, pulls drafts, builds `InventoryMovement` entities with `createdByUserId` + ids, and persists item + movements atomically):
   - `CreateInventoryItemUseCase`: validate product exists, reject duplicate position (`ConflictError`), create item, append opening movement when initial available > 0.
   - `GetInventoryItemUseCase`: return item read model or `NotFoundError`.
   - `AddStockUseCase`, `ReserveStockUseCase`, `ReleaseReservationUseCase`, `ConfirmStockOutUseCase`, `AdjustStockUseCase`: load item or `NotFoundError`, apply domain method, save item + append movement.
   - `ListInventoryMovementsUseCase`: return `{ data }` from `listMovementsByProductInOrganization`.
8. **Presentation**: Add Zod params/body schemas, JSON schemas, presenter, and Fastify route file for the eight endpoints in the spec.
9. **Route registration**: Register `inventoryRoutes` in `shared/presentation/http/fastify/app.ts` with existing global plugins.
10. **Tests**: Cover domain invariants/state transitions/movement drafts, `Quantity` rules, use case product/tenant scoping and atomic persistence, schema validation, and absence of order/prescription/batch/expiration/upload/payment behavior.

## Files To Create

- `packages/api/src/shared/domain/value-objects/Quantity.ts`
- `packages/api/src/shared/domain/value-objects/Quantity.test.ts`
- `packages/api/src/modules/inventory/domain/enums/InventoryMovementType.ts`
- `packages/api/src/modules/inventory/domain/entities/InventoryMovement.ts`
- `packages/api/src/modules/inventory/domain/entities/InventoryMovement.test.ts`
- `packages/api/src/modules/inventory/domain/entities/InventoryItem.ts`
- `packages/api/src/modules/inventory/domain/entities/InventoryItem.test.ts`
- `packages/api/src/modules/inventory/application/repositories/InventoryRepository.ts`
- `packages/api/src/modules/inventory/application/use-cases/CreateInventoryItemUseCase.ts`
- `packages/api/src/modules/inventory/application/use-cases/CreateInventoryItemUseCase.test.ts`
- `packages/api/src/modules/inventory/application/use-cases/GetInventoryItemUseCase.ts`
- `packages/api/src/modules/inventory/application/use-cases/GetInventoryItemUseCase.test.ts`
- `packages/api/src/modules/inventory/application/use-cases/AddStockUseCase.ts`
- `packages/api/src/modules/inventory/application/use-cases/AddStockUseCase.test.ts`
- `packages/api/src/modules/inventory/application/use-cases/ReserveStockUseCase.ts`
- `packages/api/src/modules/inventory/application/use-cases/ReserveStockUseCase.test.ts`
- `packages/api/src/modules/inventory/application/use-cases/ReleaseReservationUseCase.ts`
- `packages/api/src/modules/inventory/application/use-cases/ReleaseReservationUseCase.test.ts`
- `packages/api/src/modules/inventory/application/use-cases/ConfirmStockOutUseCase.ts`
- `packages/api/src/modules/inventory/application/use-cases/ConfirmStockOutUseCase.test.ts`
- `packages/api/src/modules/inventory/application/use-cases/AdjustStockUseCase.ts`
- `packages/api/src/modules/inventory/application/use-cases/AdjustStockUseCase.test.ts`
- `packages/api/src/modules/inventory/application/use-cases/ListInventoryMovementsUseCase.ts`
- `packages/api/src/modules/inventory/application/use-cases/ListInventoryMovementsUseCase.test.ts`
- `packages/api/src/modules/inventory/application/use-cases/inventory-use-case-test-utils.ts`
- `packages/api/src/modules/inventory/infrastructure/create-inventory-use-cases.factory.ts`
- `packages/api/src/modules/inventory/infrastructure/prisma/InventoryItemMapper.ts`
- `packages/api/src/modules/inventory/infrastructure/prisma/InventoryMovementMapper.ts`
- `packages/api/src/modules/inventory/infrastructure/prisma/PrismaInventoryRepository.ts`
- `packages/api/src/modules/inventory/presentation/http/inventory-presenter.ts`
- `packages/api/src/modules/inventory/presentation/http/inventory-schemas.ts`
- `packages/api/src/modules/inventory/presentation/http/inventory-schemas.test.ts`
- `packages/api/src/modules/inventory/presentation/http/inventory-routes.ts`
- `packages/api/prisma/migrations/<timestamp>_organization_product_inventory/migration.sql`
- Optional route-level tests if existing Fastify inject setup is straightforward: `packages/api/src/modules/inventory/presentation/http/inventory-routes.test.ts`

## Files To Modify

- `packages/api/prisma/schema.prisma`: add `InventoryMovementType` enum, `InventoryItem` and `InventoryMovement` models, `Organization.inventoryItems` relation, `Product.inventoryItem` relation, indexes, and the `[organizationId, productId]` unique constraint.
- `packages/api/src/shared/presentation/http/fastify/app.ts`: import and register `inventoryRoutes`.
- `specs/011-organization-product-inventory/*`: spec, plan, research, data model, contract, quickstart, checklists, tasks.
- `AGENTS.md`: managed Spec Kit plan reference (if present).

## Risks

- **Movement actor sourcing**: `createdByUserId` comes from the request body in this phase. Document clearly that it is temporary and a future RBAC/session spec will replace it; validate it as non-blank.
- **Atomicity drift**: Item update and movement insert must share one `UnitOfWork`; tests must assert that a failed invariant leaves both unchanged.
- **Tenant leakage**: Every repository read must include `organizationId` and `productId`; tests must create/fake inventory in different organizations.
- **Quantity precision decision**: `Quantity` is integer-only this phase. If fractional grams become required, this affects `Quantity`, schemas, and Prisma column types; documented in research as a future decision.
- **Reserve/out semantics**: `confirmStockOut` consumes reserved quantity (reserve -> out lifecycle). Document so consumers do not expect direct out from available.
- **Over-implementation toward orders**: Do not add orders, order-bound reservations, prescriptions, checkout, payment, batch, expiration, multiple stocks, or transfers.
- **Product mutation**: Inventory must never write `Product`; only read existence. Review confirms no `Product` writes.
- **Generated Prisma client missing new models/enum**: Run `pnpm prisma:generate` after schema/migration changes before typecheck/tests.

## Implementation Order

1. Add `Quantity` value object with tests.
2. Add `InventoryMovementType` enum.
3. Add `InventoryMovement` audit entity with tests.
4. Add `InventoryItem` aggregate root (with movement drafts and `pullMovements`) and tests.
5. Add Prisma enum/models/relations/unique/indexes and migration for organization product inventory.
6. Add `InventoryRepository` interface, `InventoryItemReadModel`, and `InventoryMovementReadModel`.
7. Add `InventoryItemMapper` and `InventoryMovementMapper`.
8. Add `PrismaInventoryRepository`.
9. Add create/get/add-stock/reserve/release/confirm/adjust/list-movements use cases and tests.
10. Add inventory presenter.
11. Add Zod schemas and schema tests.
12. Add Fastify route handlers for all eight endpoints.
13. Add inventory use-case factory and register inventory routes in `app.ts`.
14. Add/adjust route-level tests if practical.
15. Run Prisma generation and validation gates.

## Rollback

1. Revert route registration from `packages/api/src/shared/presentation/http/fastify/app.ts`.
2. Remove `packages/api/src/modules/inventory`.
3. Remove `packages/api/src/shared/domain/value-objects/Quantity.ts` and its test if unused elsewhere.
4. Revert `InventoryItem`, `InventoryMovement`, `InventoryMovementType`, `Organization.inventoryItems`, `Product.inventoryItem`, and the inventory migration from Prisma files.
5. Run `pnpm prisma:generate` to restore the generated client shape.
6. Re-run `pnpm typecheck:api` and `pnpm test:api` to confirm the previous API surface is restored.

If an inventory migration has already been applied to a shared database, create a reversing migration that drops the `inventory_movements` and `inventory_items` tables and the `InventoryMovementType` enum type only if no dependent feature has started using them.

## Commands de Validacao

```bash
pnpm prisma:generate
pnpm typecheck:api
pnpm --filter @flora/api lint
pnpm test:api
pnpm build:api
```

Additional targeted checks during implementation:

```bash
pnpm --filter @flora/api test InventoryItem
pnpm --filter @flora/api test Quantity
pnpm --filter @flora/api test inventory-schemas
```

## Phase 0 Research Summary

See [research.md](./research.md). All planning unknowns are resolved.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- API contract: [contracts/organization-product-inventory.openapi.yaml](./contracts/organization-product-inventory.openapi.yaml)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Monorepo Boundaries**: PASS. Design artifacts still target only `packages/api` and feature docs.
- **Shared Contracts**: PASS. Backend API contracts are documented; no shared package types are required until a web/shared consumer exists.
- **Tenant Isolation**: PASS. Data model, contracts, repository plan, and quickstart scenarios all require `organizationId`/`productId` scoping.
- **Clean Layering**: PASS. Planned files preserve domain/application/infrastructure/presentation boundaries and keep Prisma/Fastify/Zod outside domain; the domain stays unaware of `createdByUserId` sourcing.
- **Verifiable Delivery**: PASS. Quickstart and tests cover create/read/add/reserve/release/confirm/adjust/history, invariants, atomic persistence, tenant isolation, and no order/prescription/batch/expiration/upload/payment behavior.

## Complexity Tracking

No constitution violations.

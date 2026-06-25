# Tasks: Controle Backend de Estoque de Produtos da Organizacao

**Input**: Design documents from `/specs/011-organization-product-inventory/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/organization-product-inventory.openapi.yaml](./contracts/organization-product-inventory.openapi.yaml), [quickstart.md](./quickstart.md)

**Tests**: Required. This feature changes API contracts, tenant isolation, validation, persistence, domain invariants, and append-only auditing.

**Repository split note**: This task list uses two repositories — `InventoryItemRepository` and `InventoryMovementRepository` (each with a Prisma implementation) — per the approved task order. This supersedes the single `InventoryRepository` mentioned in earlier drafts of `data-model.md`/`plan.md`. `InventoryItem` remains the Aggregate Root; the dedicated movement repository only appends and queries the append-only audit trail, and both writes run inside the same `UnitOfWork` for atomicity.

## Format: `[ID] [Layer] Description`

- **[Layer]**: Domain, Application, Infrastructure, Presentation, Test, or Validation.
- Each task uses exact repository paths and includes `Objective`, `Depends`, and `Acceptance`.
- No task implements frontend, orders, order-bound reservations, prescriptions, checkout, payment, upload/images, batch/lot, expiration, multiple stocks, transfers, or RBAC, and no task mutates `Product`.

---

## Domain

- [x] T001 [Domain] Create `InventoryMovementType` enum in `packages/api/src/modules/inventory/domain/enums/InventoryMovementType.ts`. Objective: define `IN`, `OUT`, `RESERVE`, `RELEASE`, `ADJUSTMENT`; Depends: none; Acceptance: exported enum values match the spec exactly.
- [x] T002 [Domain] Create shared `Quantity` value object in `packages/api/src/shared/domain/value-objects/Quantity.ts`. Objective: enforce integer, nonnegative quantity via `DomainValidationError`, mirroring `MoneyInCents`; Depends: none; Acceptance: exposes `create(value)` and `value`, rejects non-integer and negative values, and has no infrastructure import.
- [x] T003 [Domain] Create `InventoryItem` Aggregate Root in `packages/api/src/modules/inventory/domain/entities/InventoryItem.ts`. Objective: model `organizationId`, `productId`, and `Quantity` available/reserved/minimum; implement `addStock`, `reserve`, `releaseReservation`, `confirmStockOut`, `adjustStock`; buffer one `InventoryMovementDraft` per operation; buffer an opening `IN` draft when created with available > 0; expose `pullMovements()` and `belowMinimum`; Depends: T001, T002; Acceptance: extends `AggregateRoot`, enforces nonnegativity, reserve <= available, release/out <= reserved, never mutates `Product`, and exposes a `restore` factory for rehydration without buffering movements.
- [x] T004 [Domain] Create `InventoryMovement` append-only Entity in `packages/api/src/modules/inventory/domain/entities/InventoryMovement.ts`. Objective: model `organizationId`, `inventoryItemId`, `productId`, `type`, `Quantity` quantity, optional `reason`, `createdByUserId`; validate non-blank ids/actor and valid type; Depends: T001, T002; Acceptance: extends `Entity`, normalizes optional `reason`, and exposes no update/delete behavior.

## Infrastructure - Persistence (Prisma)

- [x] T005 [Infrastructure] Update Prisma schema in `packages/api/prisma/schema.prisma`. Objective: add `InventoryMovementType` enum; `InventoryItem` model (`inventory_items`, integer quantity columns defaulting to 0, `@@unique([organizationId, productId])`, `@@index([organizationId])`, relations to `Organization` and `Product`); `InventoryMovement` model (`inventory_movements`, enum `type`, integer `quantity`, nullable `reason`, scalar `createdByUserId`, `createdAt` default now, relation to `InventoryItem`, `@@index([organizationId, productId])`, `@@index([inventoryItemId])`); add `Organization.inventoryItems` and `Product.inventoryItems` back-relations; Depends: T001; Acceptance: schema contains no order/batch/expiration/payment/upload fields and represents all data-model fields.
- [x] T006 [Infrastructure] Create migration in `packages/api/prisma/migrations/<timestamp>_organization_product_inventory/migration.sql` (only if required by the schema change, which it is). Objective: create the enum type, both tables, indexes, unique constraint, and foreign keys for PostgreSQL; Depends: T005; Acceptance: forward-only migration that creates only inventory persistence and no order/batch/expiration/payment/upload tables.

## Application - Repository Interfaces

- [x] T007 [Application] Create `InventoryItemRepository` interface in `packages/api/src/modules/inventory/application/repositories/InventoryItemRepository.ts`. Objective: define `InventoryItemReadModel` (with `belowMinimum`) and scoped methods `findByProductInOrganization`, `findDetailsByProductInOrganization`, `existsForProduct`, `create`, `save`; Depends: T003; Acceptance: no unscoped reads for API use cases.
- [x] T008 [Application] Create `InventoryMovementRepository` interface in `packages/api/src/modules/inventory/application/repositories/InventoryMovementRepository.ts`. Objective: define `InventoryMovementReadModel` and methods `append(movements)` and `listByProductInOrganization(organizationId, productId)`; Depends: T004; Acceptance: append-only contract with no update/delete methods.

## Infrastructure - Mappers and Prisma Repositories

- [x] T009 [Infrastructure] Create `InventoryItemMapper` in `packages/api/src/modules/inventory/infrastructure/prisma/InventoryItemMapper.ts`. Objective: map Prisma rows to domain (`restore`) and to read model (compute `belowMinimum`), and domain to create/update inputs; Depends: T003, T005, T007; Acceptance: preserves quantities, ids, and timestamps.
- [x] T010 [Infrastructure] Create `InventoryMovementMapper` in `packages/api/src/modules/inventory/infrastructure/prisma/InventoryMovementMapper.ts`. Objective: map domain movements to create inputs and Prisma rows to read model; Depends: T004, T005, T008; Acceptance: preserves `type`, `quantity`, `reason`, `createdByUserId`, `createdAt`, and links.
- [x] T011 [Infrastructure] Create `PrismaInventoryItemRepository` in `packages/api/src/modules/inventory/infrastructure/prisma/PrismaInventoryItemRepository.ts`. Objective: implement `InventoryItemRepository` over `TransactionalPrisma`; Depends: T007, T009; Acceptance: all reads scoped by `{ organizationId, productId }`; `create`/`save` use the mapper.
- [x] T012 [Infrastructure] Create `PrismaInventoryMovementRepository` in `packages/api/src/modules/inventory/infrastructure/prisma/PrismaInventoryMovementRepository.ts`. Objective: implement `InventoryMovementRepository` over `TransactionalPrisma`; Depends: T008, T010; Acceptance: `append` inserts via the mapper; `listByProductInOrganization` is scoped and ordered by `createdAt` desc; no update/delete.

## Application - Use Cases

- [x] T013 [Application] Create `CreateInventoryItemUseCase` in `packages/api/src/modules/inventory/application/use-cases/CreateInventoryItemUseCase.ts`. Objective: validate product existence via `ProductRepository.findByIdInOrganization` (`NotFoundError`), reject duplicate via `existsForProduct` (`ConflictError`), create the item, build the opening movement from pulled drafts with `createdByUserId`, and persist item + movement atomically in `UnitOfWork`; Depends: T007, T008, T011, T012; Acceptance: returns `InventoryItemReadModel`; depends only on interfaces.
- [x] T014 [Application] Create `GetInventoryItemUseCase` in `packages/api/src/modules/inventory/application/use-cases/GetInventoryItemUseCase.ts`. Objective: return the scoped position read model or throw `NotFoundError`; Depends: T007; Acceptance: no Prisma/Fastify/Zod dependency.
- [x] T015 [Application] Create `AddStockUseCase` in `packages/api/src/modules/inventory/application/use-cases/AddStockUseCase.ts`. Objective: load scoped item or `NotFoundError`, call `addStock`, save item + append `IN` movement atomically; Depends: T007, T008, T011, T012; Acceptance: returns updated read model.
- [x] T016 [Application] Create `ReserveStockUseCase` in `packages/api/src/modules/inventory/application/use-cases/ReserveStockUseCase.ts`. Objective: load scoped item or `NotFoundError`, call `reserve`, persist item + `RESERVE` movement atomically; Depends: T007, T008, T011, T012; Acceptance: rejects reserve above available (`DomainValidationError`) with no persistence.
- [x] T017 [Application] Create `ReleaseReservationUseCase` in `packages/api/src/modules/inventory/application/use-cases/ReleaseReservationUseCase.ts`. Objective: load scoped item or `NotFoundError`, call `releaseReservation`, persist item + `RELEASE` movement atomically; Depends: T007, T008, T011, T012; Acceptance: rejects release above reserved with no persistence.
- [x] T018 [Application] Create `ConfirmStockOutUseCase` in `packages/api/src/modules/inventory/application/use-cases/ConfirmStockOutUseCase.ts`. Objective: load scoped item or `NotFoundError`, call `confirmStockOut`, persist item + `OUT` movement atomically; Depends: T007, T008, T011, T012; Acceptance: rejects out above reserved with no persistence; available unchanged.
- [x] T019 [Application] Create `AdjustStockUseCase` in `packages/api/src/modules/inventory/application/use-cases/AdjustStockUseCase.ts`. Objective: load scoped item or `NotFoundError`, call `adjustStock`, persist item + `ADJUSTMENT` movement atomically; Depends: T007, T008, T011, T012; Acceptance: sets available to absolute value; reserved unchanged.
- [x] T020 [Application] Create `ListInventoryMovementsUseCase` in `packages/api/src/modules/inventory/application/use-cases/ListInventoryMovementsUseCase.ts`. Objective: verify the scoped position exists (`NotFoundError`) then return `{ data }` from `listByProductInOrganization`; Depends: T007, T008; Acceptance: most-recent-first, no cross-tenant data.

## Presentation

- [x] T021 [Presentation] Create inventory Zod schemas in `packages/api/src/modules/inventory/presentation/http/inventory-schemas.ts`. Objective: define product-scoped params schema/JSON schema, `createInventoryItemBodySchema`, `stockOperationBodySchema` (quantity >= 1), `adjustStockBodySchema` (quantity >= 0), item/movement/list response JSON schemas, and error response schema; Depends: T001; Acceptance: Zod schemas are strict and JSON schemas match the OpenAPI contract.
- [x] T022 [Presentation] Create inventory presenter and Fastify handlers in `packages/api/src/modules/inventory/presentation/http/inventory-presenter.ts` and the handler functions in `packages/api/src/modules/inventory/presentation/http/inventory-routes.ts`. Objective: format item/movement read models to HTTP (ISO dates, `belowMinimum`) and implement the eight handler bodies parsing with Zod `safeParse`; Depends: T013-T021; Acceptance: handlers return correct status codes and a local 400 on parse failure.
- [x] T023 [Presentation] Create the inventory use-case factory and register the eight routes in `packages/api/src/modules/inventory/infrastructure/create-inventory-use-cases.factory.ts` and `packages/api/src/modules/inventory/presentation/http/inventory-routes.ts`. Objective: wire `PrismaTransactionManager`, both Prisma inventory repositories, `PrismaProductRepository`, and all eight use cases; register `POST/GET .../inventory`, `POST .../inventory/{add-stock,reserve,release-reservation,confirm-stock-out,adjust}`, `GET .../inventory/movements`; Depends: T022; Acceptance: factory keeps Prisma in infrastructure; routes expose all eight endpoints.
- [x] T024 [Presentation] Register inventory routes in `packages/api/src/shared/presentation/http/fastify/app.ts`. Objective: import and register `inventoryRoutes` after the Prisma plugin; Depends: T023; Acceptance: app wires all eight endpoints without touching `packages/web`.

## Tests

- [x] T025 [Test] Create `Quantity` unit tests in `packages/api/src/shared/domain/value-objects/Quantity.test.ts`. Objective: cover zero, positive integers, negative rejection, and non-integer rejection; Depends: T002; Acceptance: tests pass against the value object rules.
- [x] T026 [Test] Create domain unit tests in `packages/api/src/modules/inventory/domain/entities/InventoryItem.test.ts` and `packages/api/src/modules/inventory/domain/entities/InventoryMovement.test.ts`. Objective: test each method's effect and single movement draft, opening movement on create, reserve/release/out limit rejections, adjust absolute set with reserved preserved, nonnegativity, and movement field validation; Depends: T003, T004; Acceptance: exactly one draft per successful operation and zero drafts on rejected operations.
- [x] T027 [Test] Create use-case unit tests and shared fakes in `packages/api/src/modules/inventory/application/use-cases/inventory-use-case-test-utils.ts`, one `*.test.ts` per use case, and `packages/api/src/modules/inventory/presentation/http/inventory-schemas.test.ts`. Objective: in-memory item/movement repositories, a product repository fake, and an immediate unit of work; verify create/get/add/reserve/release/confirm/adjust/list behavior, tenant scoping, conflict, not-found, atomic item+movement persistence, and schema validation; Depends: T013-T021; Acceptance: no Prisma usage; rejected operations append no movement.
- [x] T028 [Test] Create HTTP route test placeholder in `packages/api/src/modules/inventory/presentation/http/inventory-routes.test.ts` mirroring the existing product convention. Objective: document that HTTP success-path coverage is deferred until a shared Fastify-inject database pattern exists, keeping coverage in domain/use-case/schema tests; Depends: T024; Acceptance: `describe.skip` placeholder consistent with `product-routes.test.ts`.

## Validation

- [x] T029 [Validation] Run `pnpm prisma:generate`. Objective: regenerate the Prisma client after schema/migration changes; Depends: T005, T006; Acceptance: command exits 0.
- [x] T030 [Validation] Run `pnpm typecheck:api`. Objective: validate TypeScript types and layer imports; Depends: T029; Acceptance: command exits 0.
- [x] T031 [Validation] Run `pnpm --filter @flora/api lint`. Objective: validate lint rules; Depends: T030; Acceptance: command exits 0.
- [x] T032 [Validation] Run `pnpm test:api`. Objective: validate `Quantity`, domain, use-case, schema, and placeholder tests; Depends: T031; Acceptance: command exits 0.
- [x] T033 [Validation] Run `pnpm build:api`. Objective: validate the production build; Depends: T032; Acceptance: command exits 0.

---

## Requested Order Mapping

1. `InventoryMovementType` enum → T001.
2. `Quantity` value object → T002.
3. `InventoryItem` Aggregate Root → T003.
4. `InventoryMovement` Entity → T004.
5. Prisma schema → T005.
6. Migration → T006.
7. `InventoryItemRepository` → T007.
8. `InventoryMovementRepository` → T008.
9. `InventoryItemMapper` → T009.
10. `InventoryMovementMapper` → T010.
11. `PrismaInventoryItemRepository` → T011.
12. `PrismaInventoryMovementRepository` → T012.
13. `CreateInventoryItemUseCase` → T013.
14. `GetInventoryItemUseCase` → T014.
15. `AddStockUseCase` → T015.
16. `ReserveStockUseCase` → T016.
17. `ReleaseReservationUseCase` → T017.
18. `ConfirmStockOutUseCase` → T018.
19. `AdjustStockUseCase` → T019.
20. `ListInventoryMovementsUseCase` → T020.
21. Zod schemas → T021.
22. Fastify handlers → T022.
23. Fastify routes → T023.
24. Register routes → T024.
25. `Quantity` unit tests → T025.
26. `InventoryItem` unit tests → T026.
27. Use-case unit tests → T027.
28. HTTP tests (placeholder, no pattern) → T028.
29. Prisma generate → T029.
30. Typecheck → T030.
31. Lint → T031.
32. Tests → T032.
33. Build → T033.

## Guardrails

- Backend only; do not alter `packages/web`.
- No orders, order-bound reservations, prescriptions, checkout, payment, upload, image, batch/lot, expiration, multiple-stock, transfer, or RBAC code.
- Inventory must never write to `Product`; only read product existence.
- Every successful operation generates exactly one append-only movement; never update or delete movements.
- Persist item update and movement insert atomically in one `UnitOfWork`.
- Keep Domain free of Prisma/Fastify/Zod/HTTP and unaware of how `createdByUserId` is sourced.
- Keep Application free of direct Prisma access; supply `createdByUserId` when building movements.
- Keep Prisma repositories/mappers in Infrastructure; keep handlers/routes and Zod in Presentation.
- Run migration against a database only if necessary; the migration file is created regardless.

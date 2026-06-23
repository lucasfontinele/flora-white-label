# Tasks: CRUD Backend de Produtos da Organizacao

**Input**: Design documents from `/specs/010-organization-product-crud/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/organization-products.openapi.yaml](./contracts/organization-products.openapi.yaml), [quickstart.md](./quickstart.md)

**Tests**: Required. This feature changes API contracts, tenant isolation, validation, persistence, and domain invariants.

**Organization**: Tasks are grouped by user story and layer. Each task includes files, objective, dependencies, and acceptance criteria. No task implements stock, `InventoryItem`, `InventoryMovement`, orders, reservations, prescriptions, upload/images, frontend, custom categories, advanced permissions, or payments.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after listed dependencies are complete because it touches different files.
- **[Story]**: User story label from `spec.md`.
- Each task uses exact repository paths and includes `Objective`, `Depends`, and `Acceptance`.

## Phase 1: Setup

**Purpose**: Create only the product module folder structure needed by the planned backend slice.

- [x] T001 Create product module directories in `packages/api/src/modules/products/{domain/enums,domain/entities,application/repositories,application/use-cases,infrastructure/prisma,presentation/http}`. Objective: prepare scoped module layout; Depends: none; Acceptance: directories exist and no files outside product/docs are created.

---

## Phase 2: Foundational Domain and Persistence

**Purpose**: Establish product domain primitives, aggregate, repository contract, and persistence shape that all user stories depend on.

**CRITICAL**: No user story implementation should start until this phase is complete.

- [x] T002 [P] Create `ProductCategory` enum in `packages/api/src/modules/products/domain/enums/ProductCategory.ts`. Objective: define `FLOWER`, `OIL`, `EXTRACT`, `CAPSULE`, `EDIBLE`, `TOPICAL`, `VAPORIZER`, `ACCESSORY`, `OTHER`; Depends: T001; Acceptance: exported enum matches spec exactly.
- [x] T003 [P] Create `ProductType` enum in `packages/api/src/modules/products/domain/enums/ProductType.ts`. Objective: define `CBD`, `THC`, `BALANCED`, `FULL_SPECTRUM`, `BROAD_SPECTRUM`, `ISOLATE`; Depends: T001; Acceptance: exported enum matches spec exactly.
- [x] T004 [P] Create `StrainType` enum in `packages/api/src/modules/products/domain/enums/StrainType.ts`. Objective: define `INDICA`, `SATIVA`, `HYBRID`; Depends: T001; Acceptance: exported enum matches spec exactly.
- [x] T005 [P] Create `ProductUnit` enum in `packages/api/src/modules/products/domain/enums/ProductUnit.ts`. Objective: define `GRAM`, `MILLILITER`, `UNIT`; Depends: T001; Acceptance: exported enum matches spec exactly.
- [x] T006 Create `Product` Aggregate Root in `packages/api/src/modules/products/domain/entities/Product.ts`. Objective: model product fields, validation, default active state, and activate/deactivate/soft-delete behavior; Depends: T002, T003, T004, T005; Acceptance: class extends `AggregateRoot`, validates required fields and nonnegative percentages, and exposes all product getters.
- [x] T007 Reuse `MoneyInCents` in `packages/api/src/modules/products/domain/entities/Product.ts`. Objective: represent price through `packages/api/src/shared/domain/value-objects/MoneyInCents.ts`; Depends: T006; Acceptance: `Product` stores price as `MoneyInCents`, exposes `priceInCents`, and does not create a new money value object.
- [x] T008 Update Prisma schema in `packages/api/prisma/schema.prisma`. Objective: add `Product` model, product Prisma enums, `Organization.products` relation, `organizationId` foreign key, `isActive`, timestamps, and organization-scoped indexes; Depends: T002, T003, T004, T005; Acceptance: schema contains no inventory/order/upload/payment fields and represents all Product fields from data model.
- [x] T009 Create product migration in `packages/api/prisma/migrations/<timestamp>_organization_products/migration.sql`. Objective: create product enum types/table/indexes/foreign key for PostgreSQL; Depends: T008; Acceptance: migration applies only product catalog persistence and does not create stock, batch, expiration, order, image, or payment tables.
- [x] T010 Create `ProductRepository` interface in `packages/api/src/modules/products/application/repositories/ProductRepository.ts`. Objective: define `ProductReadModel` and organization-scoped methods; Depends: T006; Acceptance: interface includes `findByIdInOrganization`, `findDetailsByIdInOrganization`, `findAllByOrganization`, `create`, and `save`, with no unscoped product read methods for API use cases.
- [x] T011 Create `ProductMapper` in `packages/api/src/modules/products/infrastructure/prisma/ProductMapper.ts`. Objective: map Prisma records to domain/read model and domain to persistence inputs; Depends: T006, T008, T010; Acceptance: mapper preserves enums, nullable optional fields, `MoneyInCents`, `isActive`, timestamps, and `organizationId`.
- [x] T012 Create `PrismaProductRepository` in `packages/api/src/modules/products/infrastructure/prisma/PrismaProductRepository.ts`. Objective: implement `ProductRepository` using `TransactionalPrisma`; Depends: T010, T011; Acceptance: all item reads are scoped by `organizationId` and list reads use `organizationId`.
- [x] T013 Create product use-case test utilities in `packages/api/src/modules/products/application/use-cases/product-use-case-test-utils.ts`. Objective: provide in-memory product repository, organization repository fake, and unit-of-work fake for use-case tests; Depends: T010; Acceptance: utilities support cross-organization scenarios and do not use Prisma.
- [x] T014 Create product domain tests in `packages/api/src/modules/products/domain/entities/Product.test.ts`. Objective: test aggregate validation, `MoneyInCents`, optional fields, default active state, activate/deactivate, and soft delete behavior; Depends: T006, T007; Acceptance: tests fail before implementation completion and cover no inventory fields.

**Checkpoint**: Domain, persistence contract, mapper/repository skeleton, and product test foundation are ready.

---

## Phase 3: User Story 1 - Cadastrar produto da organizacao (Priority: P1) MVP

**Goal**: Allow creating a valid organization product that belongs to an organization, uses price in cents, and starts active.

**Independent Test**: Create a product for an organization with valid data and confirm it receives an ID, keeps `organizationId`, stores `priceInCents`, and returns `isActive = true`.

### Tests for User Story 1

- [x] T015 [P] [US1] Add create-product use-case tests in `packages/api/src/modules/products/application/use-cases/CreateProductUseCase.test.ts`. Objective: verify valid create, organization-not-found, required field validation, nonnegative money/percentages, and default active state; Depends: T013, T014; Acceptance: tests cover `OrganizationRepository.findById` and no Prisma usage.
- [x] T016 [P] [US1] Add create-product schema tests in `packages/api/src/modules/products/presentation/http/product-schemas.test.ts`. Objective: verify create body and organization params validation; Depends: T002, T003, T004, T005; Acceptance: tests reject blank name, missing required fields, invalid enums, negative price, and negative percentages.

### Implementation for User Story 1

- [x] T017 [US1] Create `CreateProductUseCase` in `packages/api/src/modules/products/application/use-cases/CreateProductUseCase.ts`. Objective: validate organization existence, instantiate `Product`, and persist with `UnitOfWork`; Depends: T010, T013, T015; Acceptance: returns `ProductReadModel`, throws `NotFoundError` for missing organization, and depends only on repository interfaces.
- [x] T018 [US1] Create base product presenter in `packages/api/src/modules/products/presentation/http/product-presenter.ts`. Objective: format `ProductReadModel` dates and nullable fields for HTTP responses; Depends: T010; Acceptance: response shape matches contract Product schema and includes no inventory fields.
- [x] T019 [US1] Create initial product Zod schemas in `packages/api/src/modules/products/presentation/http/product-schemas.ts`. Objective: define `organizationProductParamsSchema`, `listProductsQuerySchema`, `createProductBodySchema`, JSON schemas, enum schemas, product response schema, list response schema, and error response schema; Depends: T002, T003, T004, T005, T016; Acceptance: Zod schemas are strict, query schema accepts no unsupported filters in this spec, and JSON schemas match `contracts/organization-products.openapi.yaml`.
- [x] T020 [US1] Create product use-case factory in `packages/api/src/modules/products/infrastructure/create-product-use-cases.factory.ts`. Objective: wire `PrismaTransactionManager`, `PrismaOrganizationRepository`, `PrismaProductRepository`, and `CreateProductUseCase`; Depends: T012, T017; Acceptance: factory exports `createProductUseCase` and keeps Prisma in infrastructure.
- [x] T021 [US1] Create Fastify route file with POST handler in `packages/api/src/modules/products/presentation/http/product-routes.ts`. Objective: register `POST /organizations/:organizationId/products` using Zod `safeParse`, factory use case, presenter, and documented response schemas; Depends: T017, T018, T019, T020; Acceptance: handler returns 201 for valid create and local 400 validation errors for invalid params/body.

**Checkpoint**: US1 is independently functional when the route is registered and Prisma client is generated.

---

## Phase 4: User Story 2 - Consultar catalogo de produtos da organizacao (Priority: P2)

**Goal**: Allow listing all management products for an organization and fetching one product by ID without tenant leakage.

**Independent Test**: Create/fake products in two organizations, list and get by ID, and confirm each response only exposes products from the requested organization.

### Tests for User Story 2

- [x] T022 [P] [US2] Add list-products use-case tests in `packages/api/src/modules/products/application/use-cases/ListProductsUseCase.test.ts`. Objective: verify list returns only products for requested organization and supports empty lists; Depends: T013; Acceptance: tests include active and inactive products and cross-organization data.
- [x] T023 [P] [US2] Add get-product use-case tests in `packages/api/src/modules/products/application/use-cases/GetProductByIdUseCase.test.ts`. Objective: verify scoped lookup returns product and cross-organization/missing product throws `NotFoundError`; Depends: T013; Acceptance: tests prove no unscoped product access.
- [x] T024 [P] [US2] Extend schema tests in `packages/api/src/modules/products/presentation/http/product-schemas.test.ts`. Objective: verify product ID params, list query validation, and list response schema expectations; Depends: T019; Acceptance: tests cover blank `organizationId`, blank `productId`, unsupported query params, and strict response fields.

### Implementation for User Story 2

- [x] T025 [US2] Create `ListProductsUseCase` in `packages/api/src/modules/products/application/use-cases/ListProductsUseCase.ts`. Objective: return `{ data }` from organization-scoped repository list; Depends: T010, T022; Acceptance: use case calls `findAllByOrganization` and has no Prisma/Fastify/Zod dependency.
- [x] T026 [US2] Create `GetProductByIdUseCase` in `packages/api/src/modules/products/application/use-cases/GetProductByIdUseCase.ts`. Objective: fetch product details by organization and product ID; Depends: T010, T023; Acceptance: use case throws `NotFoundError("Product not found.")` when scoped record is absent.
- [x] T027 [US2] Extend use-case factory in `packages/api/src/modules/products/infrastructure/create-product-use-cases.factory.ts`. Objective: wire `listProductsUseCase` and `getProductByIdUseCase`; Depends: T025, T026; Acceptance: factory exports both new use cases without changing existing create wiring.
- [x] T028 [US2] Extend product routes in `packages/api/src/modules/products/presentation/http/product-routes.ts`. Objective: register `GET /organizations/:organizationId/products` and `GET /organizations/:organizationId/products/:productId`; Depends: T019, T025, T026, T027; Acceptance: list validates params/query, returns `{ data: [...] }`, get returns a single product, and invalid params/query return 400.

**Checkpoint**: US2 is independently testable with list/get routes and organization-scoped repository behavior.

---

## Phase 5: User Story 3 - Atualizar produto da organizacao (Priority: P3)

**Goal**: Allow replacing editable product catalog data while preserving ID, organization, previous data on validation failure, and tenant isolation.

**Independent Test**: Create/fake a product, update editable fields with valid data, and confirm later reads return updated values with the same `id` and `organizationId`.

### Tests for User Story 3

- [x] T029 [P] [US3] Add update-product use-case tests in `packages/api/src/modules/products/application/use-cases/UpdateProductUseCase.test.ts`. Objective: verify successful update, optional fields removal, missing product, cross-organization product, invalid money, and invalid percentages; Depends: T013, T014; Acceptance: tests prove previous product is not saved when validation fails.
- [x] T030 [P] [US3] Extend schema tests in `packages/api/src/modules/products/presentation/http/product-schemas.test.ts`. Objective: verify update body uses complete replacement validation; Depends: T019; Acceptance: tests reject missing required fields, extra fields, invalid enums, negative price, and negative percentages.

### Implementation for User Story 3

- [x] T031 [US3] Add update behavior to `Product` in `packages/api/src/modules/products/domain/entities/Product.ts`. Objective: implement `updateCatalogData` for name, description, category, type, strainType, thcPercentage, cbdPercentage, unit, and price; Depends: T006, T007, T029; Acceptance: method preserves `id`, `organizationId`, and `isActive`, and reuses same validation rules as creation.
- [x] T032 [US3] Create `UpdateProductUseCase` in `packages/api/src/modules/products/application/use-cases/UpdateProductUseCase.ts`. Objective: fetch by organization/product ID, apply domain update, and save in `UnitOfWork`; Depends: T010, T031; Acceptance: use case throws `NotFoundError` for missing scoped product and has no Prisma/Fastify/Zod dependency.
- [x] T033 [US3] Extend product Zod schemas in `packages/api/src/modules/products/presentation/http/product-schemas.ts`. Objective: expose `updateProductBodySchema` and matching JSON schema for complete replacement; Depends: T019, T030; Acceptance: schema remains strict and shares write-body rules with create where appropriate.
- [x] T034 [US3] Extend use-case factory in `packages/api/src/modules/products/infrastructure/create-product-use-cases.factory.ts`. Objective: wire `updateProductUseCase`; Depends: T032; Acceptance: factory exports update use case without changing create/list/get behavior.
- [x] T035 [US3] Extend product routes in `packages/api/src/modules/products/presentation/http/product-routes.ts`. Objective: register `PUT /organizations/:organizationId/products/:productId`; Depends: T032, T033, T034; Acceptance: handler validates params/body, returns updated product, and returns local 400 for invalid params/body.

**Checkpoint**: US3 is independently testable with update use case, schema, and route behavior.

---

## Phase 6: User Story 4 - Desativar, reativar e remover logicamente produto (Priority: P4)

**Goal**: Allow idempotent activation/deactivation and logical removal through `isActive = false`.

**Independent Test**: Create/fake an active product, deactivate it, reactivate it, delete it logically, and confirm `isActive` changes without any stock data.

### Tests for User Story 4

- [x] T036 [P] [US4] Add delete-product use-case tests in `packages/api/src/modules/products/application/use-cases/DeleteProductUseCase.test.ts`. Objective: verify soft delete sets `isActive = false`, is idempotent for inactive products, and missing/cross-tenant products throw `NotFoundError`; Depends: T013, T014; Acceptance: tests verify repository `save` is called with inactive product and no physical delete method is required.
- [x] T037 [P] [US4] Add activate-product use-case tests in `packages/api/src/modules/products/application/use-cases/ActivateProductUseCase.test.ts`. Objective: verify activation sets `isActive = true`, is idempotent for active products, and enforces organization scope; Depends: T013, T014; Acceptance: tests cover active and inactive starting states.
- [x] T038 [P] [US4] Add deactivate-product use-case tests in `packages/api/src/modules/products/application/use-cases/DeactivateProductUseCase.test.ts`. Objective: verify deactivation sets `isActive = false`, is idempotent for inactive products, and enforces organization scope; Depends: T013, T014; Acceptance: tests cover active and inactive starting states.

### Implementation for User Story 4

- [x] T039 [US4] Ensure state transition methods in `Product` in `packages/api/src/modules/products/domain/entities/Product.ts`. Objective: implement or finalize `activate`, `deactivate`, and `delete` delegating to deactivate; Depends: T006, T036, T037, T038; Acceptance: transitions are idempotent and do not alter catalog fields.
- [x] T040 [US4] Create `DeleteProductUseCase` in `packages/api/src/modules/products/application/use-cases/DeleteProductUseCase.ts`. Objective: soft delete scoped product by setting `isActive = false`; Depends: T010, T039; Acceptance: use case saves product through repository and never calls a physical delete method.
- [x] T041 [US4] Create `ActivateProductUseCase` in `packages/api/src/modules/products/application/use-cases/ActivateProductUseCase.ts`. Objective: activate scoped product; Depends: T010, T039; Acceptance: use case throws `NotFoundError` for missing scoped product and saves active state in `UnitOfWork`.
- [x] T042 [US4] Create `DeactivateProductUseCase` in `packages/api/src/modules/products/application/use-cases/DeactivateProductUseCase.ts`. Objective: deactivate scoped product; Depends: T010, T039; Acceptance: use case throws `NotFoundError` for missing scoped product and saves inactive state in `UnitOfWork`.
- [x] T043 [US4] Extend use-case factory in `packages/api/src/modules/products/infrastructure/create-product-use-cases.factory.ts`. Objective: wire delete, activate, and deactivate use cases; Depends: T040, T041, T042; Acceptance: factory exports all seven product use cases.
- [x] T044 [US4] Extend product routes in `packages/api/src/modules/products/presentation/http/product-routes.ts`. Objective: register `DELETE /organizations/:organizationId/products/:productId`, `PATCH /activate`, and `PATCH /deactivate`; Depends: T033, T040, T041, T042, T043; Acceptance: handlers validate params, return product response with updated `isActive`, and do not expose stock fields.

**Checkpoint**: US4 is independently testable with activation, deactivation, and logical delete behavior.

---

## Phase 7: Integration and HTTP Coverage

**Purpose**: Register routes and add HTTP-level coverage if the existing test pattern supports it.

- [x] T045 Register product routes in `packages/api/src/shared/presentation/http/fastify/app.ts`. Objective: import and register `productRoutes`; Depends: T021, T028, T035, T044; Acceptance: app wires all product endpoints after Prisma plugin and without touching `packages/web`.
- [x] T046 [P] Add HTTP route tests, if Fastify inject pattern is available, in `packages/api/src/modules/products/presentation/http/product-routes.test.ts`. Objective: verify POST, GET list, GET by ID, PUT, DELETE, PATCH activate, PATCH deactivate, validation errors, and tenant isolation through HTTP; Depends: T045; Acceptance: tests either pass or task documents why route-level tests are skipped in favor of use-case/schema coverage.
- [x] T047 [P] Validate contract alignment in `specs/010-organization-product-crud/contracts/organization-products.openapi.yaml`. Objective: compare implemented route schemas/responses with OpenAPI artifact; Depends: T019, T033, T044; Acceptance: contract still contains no inventory/order/upload/payment fields and matches implemented status codes/shapes.

---

## Phase 8: Validation

**Purpose**: Run required generated-client, static, test, and build gates in the requested order.

- [x] T048 Run Prisma generate with `pnpm prisma:generate`. Objective: regenerate Prisma client after product schema changes; Depends: T008, T009; Acceptance: command exits 0.
- [x] T049 Run API typecheck with `pnpm typecheck:api`. Objective: validate TypeScript types and layer imports; Depends: T048; Acceptance: command exits 0.
- [x] T050 Run API lint with `pnpm --filter @flora/api lint`. Objective: validate lint rules; Depends: T049; Acceptance: command exits 0.
- [x] T051 Run API tests with `pnpm test:api`. Objective: validate domain, use-case, schema, mapper/repository-safe, and optional HTTP tests; Depends: T050; Acceptance: command exits 0.
- [x] T052 Run API build with `pnpm build:api`. Objective: validate production build; Depends: T051; Acceptance: command exits 0.
- [x] T053 Review implemented files for excluded scope in `packages/api/src/modules/products`, `packages/api/prisma/schema.prisma`, and `packages/api/src/shared/presentation/http/fastify/app.ts`. Objective: confirm no frontend, stock, `InventoryItem`, `InventoryMovement`, orders, reservations, prescriptions, images/uploads, custom categories, advanced permissions, or payments were added; Depends: T052; Acceptance: review finds only product catalog changes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: no dependencies.
- **Phase 2 Foundational**: depends on T001 and blocks all user stories.
- **US1 (Phase 3)**: depends on Phase 2.
- **US2 (Phase 4)**: depends on Phase 2; can be implemented after repository foundation, but route integration is simpler after US1 schemas/presenter exist.
- **US3 (Phase 5)**: depends on Phase 2 and product aggregate update behavior; practically follows US1/US2.
- **US4 (Phase 6)**: depends on Phase 2 and state transition behavior; can run after Product aggregate exists.
- **Integration (Phase 7)**: depends on user-story routes/use cases.
- **Validation (Phase 8)**: depends on all implementation tasks selected for delivery.

### User Story Dependencies

- **US1 (P1)**: MVP. No dependency on other user stories after foundation.
- **US2 (P2)**: independently testable after foundation, but reuses presenter/schemas from US1.
- **US3 (P3)**: independently testable after foundation, but reuses write schemas and Product persistence.
- **US4 (P4)**: independently testable after foundation, but reuses Product state and scoped repository.

### Requested Order Mapping

1. Enums: T002-T005.
2. Product Aggregate Root: T006.
3. MoneyInCents reuse: T007.
4. Prisma schema: T008.
5. Migration: T009.
6. ProductRepository: T010.
7. ProductMapper: T011.
8. PrismaProductRepository: T012.
9. CreateProductUseCase: T017.
10. ListProductsUseCase: T025.
11. GetProductByIdUseCase: T026.
12. UpdateProductUseCase: T032.
13. DeleteProductUseCase: T040.
14. ActivateProductUseCase: T041.
15. DeactivateProductUseCase: T042.
16. Zod schemas: T019, T033.
17. Fastify handlers: T021, T028, T035, T044.
18. Fastify routes: T021, T028, T035, T044.
19. Route registration: T045.
20. Product unit tests: T014.
21. Use-case unit tests: T015, T022, T023, T029, T036, T037, T038.
22. HTTP tests if pattern exists: T046.
23. Prisma generate: T048.
24. Typecheck: T049.
25. Lint: T050.
26. Tests: T051.
27. Build: T052.

---

## Parallel Opportunities

- T002, T003, T004, and T005 can run in parallel after T001.
- T015 and T016 can run in parallel after foundation because they touch different test files.
- T022, T023, and T024 can run in parallel after foundation/US1 schemas.
- T029 and T030 can run in parallel.
- T036, T037, and T038 can run in parallel.
- T046 and T047 can run in parallel after route implementation.

## Parallel Example: User Story 1

```text
Task: "T015 Add create-product use-case tests in packages/api/src/modules/products/application/use-cases/CreateProductUseCase.test.ts"
Task: "T016 Add create-product schema tests in packages/api/src/modules/products/presentation/http/product-schemas.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "T022 Add list-products use-case tests in packages/api/src/modules/products/application/use-cases/ListProductsUseCase.test.ts"
Task: "T023 Add get-product use-case tests in packages/api/src/modules/products/application/use-cases/GetProductByIdUseCase.test.ts"
Task: "T024 Extend schema tests in packages/api/src/modules/products/presentation/http/product-schemas.test.ts"
```

## Parallel Example: User Story 4

```text
Task: "T036 Add delete-product use-case tests in packages/api/src/modules/products/application/use-cases/DeleteProductUseCase.test.ts"
Task: "T037 Add activate-product use-case tests in packages/api/src/modules/products/application/use-cases/ActivateProductUseCase.test.ts"
Task: "T038 Add deactivate-product use-case tests in packages/api/src/modules/products/application/use-cases/DeactivateProductUseCase.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 tasks T015-T021.
3. Register route if validating through Fastify app requires T045.
4. Run targeted tests for Product, create use case, and product schemas.
5. Stop and validate that create product works independently.

### Incremental Delivery

1. Foundation: T001-T014.
2. US1 create: T015-T021.
3. US2 list/get: T022-T028.
4. US3 update: T029-T035.
5. US4 active state and soft delete: T036-T044.
6. Integration and validation: T045-T053.

### Guardrails

- Do not alter `packages/web`.
- Do not create `InventoryItem`, `InventoryMovement`, quantity, batch, expiration, order, reservation, prescription, image, upload, custom category, advanced permission, or payment code.
- Keep Domain free of Prisma/Fastify/Zod/HTTP.
- Keep Application free of direct Prisma access.
- Keep Prisma repositories/mappers in Infrastructure.
- Keep Fastify handlers/routes and Zod schemas in Presentation.

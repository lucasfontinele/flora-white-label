# Implementation Plan: CRUD Backend de Produtos da Organizacao

**Branch**: `(not set; spec directory 010-organization-product-crud)` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-organization-product-crud/spec.md`

## Summary

Build an API-only backend catalog slice for organization-owned products. The feature introduces a new `products` bounded module in `packages/api` with `Product` as an Aggregate Root, product enums, reusable `MoneyInCents` price handling, Prisma persistence, application use cases, Fastify routes, Zod validation, OpenAPI contract documentation, and focused tests.

The slice deliberately stops at catalog CRUD: no frontend, inventory, `InventoryItem`, `InventoryMovement`, available quantity, batch/lot, expiration, orders, reservations, prescriptions, images, upload, custom categories, advanced permissions, or payment integration.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js runtime, ES2022 target, NodeNext module resolution. No explicit Node engine is declared.

**Primary Dependencies**: `packages/api` uses Fastify 5.8.5, Prisma 6.19.3, PostgreSQL, Zod 4.4.3, Vitest 4.1.9, shared domain/application helpers, and an existing pnpm monorepo layout.

**Storage**: PostgreSQL through Prisma. Product data is persisted in a new `Product` Prisma model related to `Organization`; no file/object storage is used.

**Testing**: Vitest unit tests for domain invariants, use cases with in-memory fakes, schema tests for Zod payloads/params, and optional Fastify inject tests only if route-level patterns already support them cleanly. Validation gates: `pnpm prisma:generate`, `pnpm typecheck:api`, `pnpm --filter @flora/api lint`, `pnpm test:api`, and `pnpm build:api`.

**Target Platform**: Fastify API runtime only.

**Project Type**: pnpm monorepo, API-only change under `packages/api` plus feature documentation under `specs/010-organization-product-crud`.

**Performance Goals**: 95% of product create/update/get/activate/deactivate operations should complete in under 1 second in development/homologation for normal catalog sizes. Listing should support at least 1,000 products per organization without cross-tenant leakage and return in under 2 seconds in local validation conditions.

**Constraints**: Do not alter `packages/web`. Do not implement stock, inventory records, inventory movements, order/reservation/prescription flows, images/uploads, custom categories, payment integration, permission middleware, or unrelated refactors. Domain must not depend on Prisma, Fastify, Zod, HTTP, or persistence adapters. Application must depend on repository interfaces, not Prisma.

**Scale/Scope**: One new API module, four product enums, one aggregate root, one repository interface, one Prisma mapper, one Prisma repository, seven use cases, one presenter, one Zod schema file, one Fastify route file, one composition factory, one Prisma model/migration, route registration, OpenAPI contract, and focused tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: PASS. Implementation is limited to `packages/api`, `packages/api/prisma`, and feature documentation. `packages/web` remains untouched. No package imports private internals across package boundaries.
- **Shared Contracts**: PASS. Product payloads, responses, enums, route shapes, and structured error responses are documented in `contracts/organization-products.openapi.yaml`. Types remain package-local because no frontend/shared consumer is implemented in this backend-only slice.
- **Tenant Isolation**: PASS. `Product` carries mandatory `organizationId`. Every read/write route includes `:organizationId`; repositories must query by `{ organizationId, id }` for item operations and `{ organizationId }` for lists. Cross-organization product access returns not found.
- **Clean Layering**: PASS. Domain owns product invariants and state transitions. Application owns use-case orchestration and organization existence checks through interfaces. Infrastructure owns Prisma schema, mapper, and repository. Presentation owns Fastify routes, Zod parsing, JSON schema, and HTTP response translation.
- **Verifiable Delivery**: PASS. User stories are independently testable: create product, list/get product, update product, activate/deactivate/delete logically. Verification covers tenant isolation, required fields, enum validation, money/percentage invariants, persistence, HTTP contracts, and absence of inventory/upload/order/payment behavior.

## Project Structure

### Documentation (this feature)

```text
specs/010-organization-product-crud/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── organization-products.openapi.yaml
├── checklists/
│   └── requirements.md
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
    │       └── <timestamp>_organization_products/
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
        │   │       └── MoneyInCents.ts
        │   ├── infrastructure/database/prisma/
        │   └── presentation/http/fastify/
        │       └── app.ts
        └── modules/
            ├── organizations/
            │   ├── application/repositories/OrganizationRepository.ts
            │   └── infrastructure/prisma/PrismaOrganizationRepository.ts
            └── products/
                ├── application/
                │   ├── repositories/
                │   │   └── ProductRepository.ts
                │   └── use-cases/
                │       ├── ActivateProductUseCase.ts
                │       ├── CreateProductUseCase.ts
                │       ├── DeactivateProductUseCase.ts
                │       ├── DeleteProductUseCase.ts
                │       ├── GetProductByIdUseCase.ts
                │       ├── ListProductsUseCase.ts
                │       ├── UpdateProductUseCase.ts
                │       └── *.test.ts
                ├── domain/
                │   ├── entities/
                │   │   ├── Product.ts
                │   │   └── Product.test.ts
                │   └── enums/
                │       ├── ProductCategory.ts
                │       ├── ProductType.ts
                │       ├── ProductUnit.ts
                │       └── StrainType.ts
                ├── infrastructure/
                │   ├── create-product-use-cases.factory.ts
                │   └── prisma/
                │       ├── PrismaProductRepository.ts
                │       └── ProductMapper.ts
                └── presentation/http/
                    ├── product-presenter.ts
                    ├── product-routes.ts
                    ├── product-schemas.test.ts
                    └── product-schemas.ts
```

**Structure Decision**: Create a new `modules/products` bounded module because product catalog is its own domain concept and must not be nested under documents, patients, subscriptions, or future inventory. Reuse `shared/domain/value-objects/MoneyInCents.ts`, `shared/application/errors/*`, `PrismaTransactionManager`, and `OrganizationRepository` for organization existence checks.

## Current Architecture Analysis

- **Domain modules**: Current modules live under `packages/api/src/modules/<module>/domain`, usually with `entities/`, `enums/`, and sometimes `value-objects/`. Shared base classes live in `packages/api/src/shared/domain/entities`. `AggregateRoot` exists and should be used for `Product`.
- **Use cases**: Application use cases live in `packages/api/src/modules/<module>/application/use-cases`. They receive repository interfaces and `UnitOfWork` through constructors. Write operations generally run inside `PrismaTransactionManager`.
- **Repositories**: Application repository interfaces live in `packages/api/src/modules/<module>/application/repositories`. They define domain-returning methods for mutation flows and read models for response-oriented queries.
- **Prisma mappers**: Prisma mappers live in `packages/api/src/modules/<module>/infrastructure/prisma/*Mapper.ts`. They translate Prisma records to domain entities/read models and domain entities to Prisma create/update inputs.
- **Prisma repositories**: Prisma repositories live beside mappers in `infrastructure/prisma`, take `TransactionalPrisma`, and call `this.prisma.getClient()` so they work both inside and outside a transaction.
- **Factories/composition roots**: Module factories live in `packages/api/src/modules/<module>/infrastructure/create-*-use-cases.factory.ts`. They instantiate `PrismaTransactionManager`, repositories, and use cases.
- **Fastify handlers/routes**: Routes live in `packages/api/src/modules/<module>/presentation/http/*-routes.ts`. They register routes directly on `FastifyInstance`, instantiate use cases through the module factory, parse params/body with Zod `safeParse`, and call presenters for response formatting.
- **Zod usage**: Schema files define runtime Zod schemas plus JSON schemas for Fastify/OpenAPI. Zod handles trimming, non-empty strings, enum validation, integer/nonnegative numeric validation, `.strict()`, and route-specific inferred types.
- **Error handling**: Route-local validation failures return `{ error: "ValidationError", message }` with 400. Domain/application errors bubble to the global Fastify error handler in `shared/presentation/http/fastify/plugins/error-handler.ts`: `DomainValidationError` -> 422, `DomainError` -> 400, `NotFoundError` -> 404, `ConflictError` -> 409, `ForbiddenError` -> 403, `AuthenticationError` -> 401, unknown 5xx logs and returns `InternalServerError`.
- **MoneyInCents**: `packages/api/src/shared/domain/value-objects/MoneyInCents.ts` already exists and enforces integer, nonnegative cent amounts. Product must reuse it instead of creating a duplicate.
- **Organization validation/reference**: `Organization` exists in Prisma and has relations to existing organization-owned records. Application code validates organization existence via `OrganizationRepository.findById`. Organization-scoped repositories use `findFirst({ where: { id, organizationId } })` or `findMany({ where: { organizationId } })`.
- **Product presence today**: No product module, Prisma model, enum, route, or inventory model exists in `packages/api` today. The feature starts from a clean product surface.

## Target Architecture

1. **Prisma schema/migration**: Add `Product` model with `organizationId`, scalar product fields, `isActive`, timestamps, relation to `Organization`, and indexes for organization-scoped lookups. Add Prisma enums for `ProductCategory`, `ProductType`, `StrainType`, and `ProductUnit`.
2. **Domain enums**: Add domain enum files mirroring the allowed product category/type/strain/unit values from the spec.
3. **Product aggregate**: Add `Product extends AggregateRoot<ProductProps>` with factory and behavior methods:
   - `create(props, id?)` validates mandatory organization/name/category/type/unit/price and optional nonnegative percentages.
   - `updateCatalogData(input)` returns or mutates a product with validated catalog fields.
   - `activate()` sets `isActive = true`.
   - `deactivate()` sets `isActive = false`.
   - `delete()` delegates to `deactivate()` for soft delete semantics.
4. **Money**: Reuse `MoneyInCents.create(priceInCents)` for price validation and expose `priceInCents` from `Product`.
5. **Repository contract**: Add `ProductRepository` with organization-scoped methods: `findByIdInOrganization`, `findDetailsByIdInOrganization`, `findAllByOrganization`, `create`, and `save`.
6. **Prisma mapper/repository**: Map Prisma rows to `Product` and `ProductReadModel`, and persist domain values with `organizationId` scoping. `save` updates by product ID after use cases have fetched by organization.
7. **Use cases**:
   - `CreateProductUseCase`: validate organization exists, create domain product, persist in unit of work.
   - `ListProductsUseCase`: list products by organization.
   - `GetProductByIdUseCase`: fetch details by organization/product ID or throw `NotFoundError`.
   - `UpdateProductUseCase`: fetch domain product by organization/product ID, apply domain update, save in unit of work.
   - `DeleteProductUseCase`: fetch by organization/product ID, soft delete by `deactivate`, save in unit of work.
   - `ActivateProductUseCase`: fetch by organization/product ID, activate, save.
   - `DeactivateProductUseCase`: fetch by organization/product ID, deactivate, save.
8. **Presentation**: Add Zod params/body schemas, JSON schemas, presenter, and Fastify route file for the seven endpoints in the spec.
9. **Route registration**: Register `productRoutes` in `shared/presentation/http/fastify/app.ts` with existing global plugins.
10. **Tests**: Cover domain invariants/state transitions, use case organization/product scoping, schema validation, Prisma mapper behavior, and absence of stock fields in contracts/responses.

## Files To Create

- `packages/api/src/modules/products/domain/enums/ProductCategory.ts`
- `packages/api/src/modules/products/domain/enums/ProductType.ts`
- `packages/api/src/modules/products/domain/enums/StrainType.ts`
- `packages/api/src/modules/products/domain/enums/ProductUnit.ts`
- `packages/api/src/modules/products/domain/entities/Product.ts`
- `packages/api/src/modules/products/domain/entities/Product.test.ts`
- `packages/api/src/modules/products/application/repositories/ProductRepository.ts`
- `packages/api/src/modules/products/application/use-cases/CreateProductUseCase.ts`
- `packages/api/src/modules/products/application/use-cases/CreateProductUseCase.test.ts`
- `packages/api/src/modules/products/application/use-cases/ListProductsUseCase.ts`
- `packages/api/src/modules/products/application/use-cases/ListProductsUseCase.test.ts`
- `packages/api/src/modules/products/application/use-cases/GetProductByIdUseCase.ts`
- `packages/api/src/modules/products/application/use-cases/GetProductByIdUseCase.test.ts`
- `packages/api/src/modules/products/application/use-cases/UpdateProductUseCase.ts`
- `packages/api/src/modules/products/application/use-cases/UpdateProductUseCase.test.ts`
- `packages/api/src/modules/products/application/use-cases/DeleteProductUseCase.ts`
- `packages/api/src/modules/products/application/use-cases/DeleteProductUseCase.test.ts`
- `packages/api/src/modules/products/application/use-cases/ActivateProductUseCase.ts`
- `packages/api/src/modules/products/application/use-cases/ActivateProductUseCase.test.ts`
- `packages/api/src/modules/products/application/use-cases/DeactivateProductUseCase.ts`
- `packages/api/src/modules/products/application/use-cases/DeactivateProductUseCase.test.ts`
- `packages/api/src/modules/products/application/use-cases/product-use-case-test-utils.ts`
- `packages/api/src/modules/products/infrastructure/create-product-use-cases.factory.ts`
- `packages/api/src/modules/products/infrastructure/prisma/ProductMapper.ts`
- `packages/api/src/modules/products/infrastructure/prisma/PrismaProductRepository.ts`
- `packages/api/src/modules/products/presentation/http/product-presenter.ts`
- `packages/api/src/modules/products/presentation/http/product-schemas.ts`
- `packages/api/src/modules/products/presentation/http/product-schemas.test.ts`
- `packages/api/src/modules/products/presentation/http/product-routes.ts`
- `packages/api/prisma/migrations/<timestamp>_organization_products/migration.sql`
- Optional route-level tests if existing Fastify inject setup is straightforward: `packages/api/src/modules/products/presentation/http/product-routes.test.ts`

## Files To Modify

- `packages/api/prisma/schema.prisma`: add product enums, `Product` model, `Organization.products` relation, indexes.
- `packages/api/src/shared/presentation/http/fastify/app.ts`: import and register `productRoutes`.
- `specs/010-organization-product-crud/plan.md`: implementation plan.
- `specs/010-organization-product-crud/research.md`: architectural decisions.
- `specs/010-organization-product-crud/data-model.md`: data model and validation rules.
- `specs/010-organization-product-crud/contracts/organization-products.openapi.yaml`: API contract.
- `specs/010-organization-product-crud/quickstart.md`: validation guide.
- `AGENTS.md`: managed Spec Kit plan reference.

## Risks

- **Enum drift between domain and Prisma**: Keep domain enums and Prisma enums identical; add mapper/schema tests for all allowed values.
- **Tenant leakage**: Every repository read for item operations must include `organizationId`; tests must create/fake products in different organizations.
- **Soft delete ambiguity**: `DELETE` intentionally maps to `isActive = false`; document in contract and test that product data remains queryable for management.
- **Over-implementation toward inventory**: Do not add quantity, stock relations, batch, expiration, inventory repositories, or inventory use cases.
- **Organization validation inconsistency**: Create should check organization existence via `OrganizationRepository.findById`; list/get/update/delete/activate/deactivate should rely on organization-scoped product lookups and return product not found for cross-tenant access.
- **Generated Prisma client missing new model/enums**: Run `pnpm prisma:generate` after schema/migration changes before typecheck/tests.

## Implementation Order

1. Add product enums and `Product` aggregate root with tests.
2. Reuse `MoneyInCents` in `Product` price validation; do not create a new money type.
3. Add Prisma enums/model/relation/migration for organization products.
4. Add `ProductRepository` interface and `ProductReadModel`.
5. Add `ProductMapper`.
6. Add `PrismaProductRepository`.
7. Add create/list/get/update/delete/activate/deactivate use cases and use-case tests.
8. Add product presenter.
9. Add Zod schemas and schema tests.
10. Add Fastify route handlers for all seven endpoints.
11. Add product use-case factory and register product routes in `app.ts`.
12. Add/adjust route-level tests if practical.
13. Run Prisma generation and validation gates.

## Rollback

1. Revert route registration from `packages/api/src/shared/presentation/http/fastify/app.ts`.
2. Remove `packages/api/src/modules/products`.
3. Revert `Product` model, product enums, `Organization.products` relation, and product migration from Prisma files.
4. Run `pnpm prisma:generate` to restore generated client shape.
5. Re-run `pnpm typecheck:api` and `pnpm test:api` to confirm the previous API surface is restored.

If a product migration has already been applied to a shared database, create a reversing migration that drops the `products` table and product enum types only if no dependent feature has started using them.

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
pnpm --filter @flora/api test Product
pnpm --filter @flora/api test product-schemas
```

## Phase 0 Research Summary

See [research.md](./research.md). All planning unknowns are resolved.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- API contract: [contracts/organization-products.openapi.yaml](./contracts/organization-products.openapi.yaml)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Monorepo Boundaries**: PASS. Design artifacts still target only `packages/api` and feature docs.
- **Shared Contracts**: PASS. Backend API contracts are documented; no shared package types are required until a web/shared consumer exists.
- **Tenant Isolation**: PASS. Data model, contracts, repository plan, and quickstart scenarios all require `organizationId` scoping.
- **Clean Layering**: PASS. Planned files preserve domain/application/infrastructure/presentation boundaries and keep Prisma/Fastify/Zod outside domain.
- **Verifiable Delivery**: PASS. Quickstart and tests cover CRUD, activation, soft delete, validation, tenant isolation, and no inventory behavior.

## Complexity Tracking

No constitution violations.

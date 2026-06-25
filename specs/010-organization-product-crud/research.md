# Research: CRUD Backend de Produtos da Organizacao

## Decision: Create a new `products` bounded module

**Rationale**: No product module currently exists. Existing API modules follow `packages/api/src/modules/<domain>/{domain,application,infrastructure,presentation}`. Product catalog is a standalone organization-owned catalog and should not be placed under documents, patients, subscriptions, or future inventory.

**Alternatives considered**:

- Put products under `organizations`: rejected because products have their own aggregate, use cases, contracts, and future lifecycle.
- Put products under future inventory: rejected because this spec explicitly excludes stock, quantities, batches, and movements.

## Decision: Model `Product` as an Aggregate Root

**Rationale**: The spec requires `Product` as Aggregate Root. `AggregateRoot` already exists in `packages/api/src/shared/domain/entities/AggregateRoot.ts`. Product owns catalog invariants, `isActive` state transitions, and pricing/percentage validation.

**Alternatives considered**:

- Extend `Entity` only: rejected because it conflicts with acceptance criteria and weakens the consistency boundary for activate/deactivate behavior.

## Decision: Reuse shared `MoneyInCents`

**Rationale**: `packages/api/src/shared/domain/value-objects/MoneyInCents.ts` already enforces integer, nonnegative cent values. The subscription-plan module already uses it successfully for price fields.

**Alternatives considered**:

- Create a product-specific money value object: rejected because it duplicates behavior and increases drift risk.
- Use raw `number` in the domain: rejected because it bypasses an existing invariant.

## Decision: Validate organization existence on create and scope all product reads by organization

**Rationale**: Existing organization-scoped create flows, such as required documents, call `OrganizationRepository.findById` before creating organization-owned data. Existing scoped repositories use `{ organizationId, id }` for tenant isolation. This product feature should follow that pattern.

**Alternatives considered**:

- Rely only on database foreign keys: rejected because application errors would be less explicit and less consistent.
- Validate organization on every operation separately before product lookup: rejected for item operations because organization-scoped product lookup already prevents cross-tenant access and returns the desired not-found behavior.

## Decision: Soft delete via `isActive = false`

**Rationale**: The product model includes `isActive`, the spec permits soft delete when it matches project behavior, and preserving catalog records avoids premature physical deletion risks for future orders, inventory, and audit references.

**Alternatives considered**:

- Physical delete: rejected because future modules may reference products and because soft delete is explicitly aligned with the active/inactive lifecycle.
- Separate `deletedAt`: rejected because the requested model includes `isActive` only and the feature should remain scoped.

## Decision: Keep list endpoint management-oriented

**Rationale**: The spec describes backend catalog management and requires `isActive` in responses. Therefore `GET /organizations/:organizationId/products` should return active and inactive products for the organization. Public/patient catalog filtering belongs in future specs.

**Alternatives considered**:

- Return only active products: rejected because operators need to see and reactivate inactive products.
- Add query filters now: rejected because filtering was not requested and can be added later without changing the core contract.

## Decision: Use Zod in presentation only

**Rationale**: Current route files define Zod schemas and JSON schemas in `presentation/http/*-schemas.ts`, then use `safeParse` inside handlers. Domain and application code remain framework-agnostic. Product should follow this pattern.

**Alternatives considered**:

- Pass Zod schemas into use cases: rejected because application/domain must not depend on Zod.
- Use only Fastify JSON schema validation: rejected because existing modules use Zod for runtime parsing and inferred TypeScript input types.

## Decision: Use Prisma repository and mapper in infrastructure

**Rationale**: Existing modules keep mappers and Prisma repositories under `infrastructure/prisma`, with repositories accepting `TransactionalPrisma`. This preserves `UnitOfWork` transaction behavior while keeping use cases independent of Prisma.

**Alternatives considered**:

- Direct Prisma calls in use cases: rejected by project layering and explicit acceptance criteria.
- Shared generic repository abstraction: rejected because current modules use concrete module-specific interfaces and a generic layer would be unrelated refactor.

## Decision: Define backend API contract in OpenAPI YAML

**Rationale**: Product endpoints are external HTTP contracts. Spec Kit design phase requires interface contracts when a project exposes external interfaces. Existing plans use contract artifacts for API changes.

**Alternatives considered**:

- Rely only on route JSON schemas: rejected because planning artifacts should be reviewable before implementation.
- Create `packages/shared` DTOs now: rejected because the feature is backend-only and no shared consumer exists in this slice.

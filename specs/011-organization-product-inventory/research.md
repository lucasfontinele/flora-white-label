# Research: Controle Backend de Estoque de Produtos da Organizacao

## Decision: Create a new `inventory` bounded module

**Rationale**: Stock position and movements are a distinct domain concept from the product catalog. Existing API modules follow `packages/api/src/modules/<domain>/{domain,application,infrastructure,presentation}`. Inventory has its own aggregate, audit entity, use cases, contracts, and lifecycle, so it should not live inside `products`.

**Alternatives considered**:

- Put inventory under `products`: rejected because it couples two aggregates and blurs the consistency boundary.
- Put inventory under `organizations`: rejected because inventory is product-scoped, not a general organization concern.

## Decision: Model `InventoryItem` as an Aggregate Root and `InventoryMovement` as an Entity inside it

**Rationale**: The spec requires `InventoryItem` as Aggregate Root and `InventoryMovement` as an audit Entity. `AggregateRoot` and `Entity` both exist in `shared/domain/entities`. The aggregate owns quantity invariants (nonnegativity, reserve <= available, release/out <= reserved) and is the consistency boundary that guarantees "every stock change generates exactly one movement". Movements are children of the aggregate and are never loaded for mutation, only appended and queried.

**Alternatives considered**:

- Make `InventoryMovement` a separate aggregate with its own root/repository: rejected because movements have no independent lifecycle and must be created consistently with item state changes.
- Make `InventoryItem` a plain Entity: rejected because it conflicts with the spec and weakens the invariant boundary.

## Decision: Domain methods keep the `(quantity, reason)` signature; the application stamps `createdByUserId`

**Rationale**: The spec defines `addStock(quantity, reason)`, `reserve(quantity, reason)`, `releaseReservation(quantity, reason)`, `confirmStockOut(quantity, reason)`, and `adjustStock(quantity, reason)` without an actor argument. Each domain method mutates quantities and buffers an `InventoryMovementDraft { type, quantity, reason }`. The aggregate exposes `pullMovements()` (mirroring `AggregateRoot.pullDomainEvents`) returning and clearing buffered drafts. The application use case then builds the persisted `InventoryMovement` entity by combining the draft with `organizationId`, `inventoryItemId`, `productId`, and `createdByUserId`. This keeps the domain method signatures exactly as specified, lets the domain enforce "exactly one movement per operation", and treats the actor as a request-supplied audit value resolved by the application.

**Alternatives considered**:

- Pass `createdByUserId` into each domain method: rejected to honor the specified `(quantity, reason)` signatures and to keep actor sourcing in the application layer.
- Emit domain events and translate them to movements: rejected as heavier than needed; movements are persisted records, not in-process event reactions.

## Decision: `createdByUserId` is provided in the request body in this phase

**Rationale**: The spec excludes RBAC and authorization middleware. There is no mandated authenticated-actor plumbing for these routes in this slice, so the actor is taken from the request body and validated as a non-blank string. The lightweight audit-actor pattern already exists in `OrganizationDocumentApprovalLog`, which stores `organizationUserId` as a plain string without a Prisma relation. `InventoryMovement.createdByUserId` follows the same approach.

**Alternatives considered**:

- Derive the actor from an authenticated session/context: deferred because adding/altering auth context here would expand scope into RBAC. A future spec can source `createdByUserId` from the session and remove it from the body.
- Add a Prisma foreign key to `User`: rejected to mirror the existing lightweight audit-log pattern and avoid extra `User` model churn.

## Decision: Introduce a shared `Quantity` value object (integer, nonnegative)

**Rationale**: The plan step requires a `Quantity` value object and none exists. Quantities are a generic primitive analogous to `MoneyInCents`, so `Quantity` lives in `shared/domain/value-objects`. It enforces integer, nonnegative values via `DomainValidationError`, mirroring `MoneyInCents` precision philosophy. It is reused for `InventoryItem` quantities and `InventoryMovement.quantity`.

**Alternatives considered**:

- Use raw `number` in the domain: rejected because it bypasses a reusable invariant and duplicates validation across methods.
- Allow fractional quantities now (for grams/milliliters): deferred. Cannabis units (GRAM/MILLILITER) can be fractional in reality, but this phase models integer quantities to match `MoneyInCents` precision and keep invariants simple. Fractional/decimal quantities are an explicit future decision that would change `Quantity`, the Zod schemas, and the Prisma column types from `Int` to a decimal type.

## Decision: `confirmStockOut` consumes reserved quantity (reserve -> out lifecycle)

**Rationale**: The method set includes both `reserve` and `confirmStockOut`, so the natural lifecycle is `addStock (IN)` -> `reserve (RESERVE)` -> `confirmStockOut (OUT)` or `releaseReservation (RELEASE)`. `confirmStockOut` decrements `reservedQuantity` (the physically reserved goods leave) and never touches `availableQuantity` (already decremented at reserve time). The invariant `quantity <= reservedQuantity` prevents shipping more than was reserved.

**Alternatives considered**:

- `confirmStockOut` decrements `availableQuantity` (direct sale without reservation): rejected for this phase because it would require a separate operation and conflicts with the reserve/release/confirm triad. Direct out-without-reserve can be added later.

## Decision: `adjustStock` sets `availableQuantity` to a new absolute value

**Rationale**: An inventory adjustment ("ajuste apos contagem fisica") is most clearly modeled as setting `availableQuantity` to the recounted absolute value. `adjustStock(quantity, reason)` interprets `quantity` as the new absolute available value (integer, >= 0), leaves `reservedQuantity` untouched, and records an `ADJUSTMENT` movement whose `quantity` is the new absolute value. Because the input is `>= 0`, available can never become negative.

**Alternatives considered**:

- Delta-based adjustment (signed `+/-` quantity): rejected because it requires signed quantities, conflicts with the nonnegative `Quantity` value object, and is less intuitive for a physical recount. The chosen absolute model keeps every `movement.quantity` nonnegative with direction conveyed by `type`.

## Decision: One `InventoryItem` per `(organizationId, productId)` enforced by a unique constraint

**Rationale**: The spec requires at most one `InventoryItem` per product per organization in this phase. A `@@unique([organizationId, productId])` constraint enforces it at the database level, and `CreateInventoryItemUseCase` returns `ConflictError` (HTTP 409) when a position already exists.

**Alternatives considered**:

- Enforce uniqueness only in the application: rejected because a database constraint is the durable guarantee against race conditions.
- Allow multiple positions per product (multi-stock): explicitly out of scope for this phase.

## Decision: Validate product existence via the existing `ProductRepository`; never mutate `Product`

**Rationale**: Inventory operations must be scoped to a product that exists in the organization. `ProductRepository.findByIdInOrganization(organizationId, productId)` already returns an organization-scoped product or null, providing both tenant scoping and the not-found behavior. Inventory only reads product existence and never writes `Product`, satisfying "estoque nao deve alterar dados de Product".

**Alternatives considered**:

- Add a new product lookup in the inventory module: rejected as duplication; reuse the existing repository.
- Rely only on the Prisma foreign key: rejected because explicit application-level not-found errors are clearer and consistent with other modules.

## Decision: Persist item update and new movement atomically in one Unit of Work

**Rationale**: "Toda operacao deve gerar movement" must hold transactionally: a stock change and its movement must commit together or not at all. Each mutation use case runs inside `PrismaTransactionManager.execute`, calling `saveItem` and `appendMovements` within the same transaction. A failed domain invariant throws before persistence, leaving both unchanged.

**Alternatives considered**:

- Persist item and movement in separate transactions: rejected because a partial failure would break the audit guarantee.

## Decision: Opening balance on creation emits an opening `IN` movement

**Rationale**: Creation may include an initial `availableQuantity`. To keep the audit trail complete, when the initial available quantity is greater than zero the aggregate buffers an opening `IN` draft, persisted as the first movement with the provided `createdByUserId`. `reservedQuantity` always starts at zero and is not settable at creation.

**Alternatives considered**:

- Force creation to start at zero and require `add-stock` for any balance: rejected as less ergonomic; the opening movement preserves auditability either way.
- Allow setting `reservedQuantity` at creation: rejected because reservations must originate from the `reserve` operation to keep the lifecycle and audit trail consistent.

## Decision: Use Zod in presentation only; document the contract in OpenAPI

**Rationale**: Current route files define Zod schemas plus JSON schemas in `presentation/http/*-schemas.ts` and use `safeParse` in handlers, while domain/application stay framework-agnostic. Inventory follows this pattern. Endpoints are external HTTP contracts, so they are documented in `contracts/organization-product-inventory.openapi.yaml`, consistent with the product feature.

**Alternatives considered**:

- Pass Zod schemas into use cases: rejected because application/domain must not depend on Zod.
- Rely only on route JSON schemas without an OpenAPI artifact: rejected because planning artifacts should be reviewable before implementation.

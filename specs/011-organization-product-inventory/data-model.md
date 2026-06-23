# Data Model: Controle Backend de Estoque de Produtos da Organizacao

## InventoryItem

Aggregate Root for the stock position of a product within an organization.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Stable inventory item identifier. |
| `organizationId` | string | yes | Tenant owner. Must be present for every position. |
| `productId` | string | yes | Product owner. One position per product per organization. |
| `availableQuantity` | `Quantity` | yes | Integer, nonnegative. Free-to-reserve quantity. Defaults to 0. |
| `reservedQuantity` | `Quantity` | yes | Integer, nonnegative. Committed-but-not-shipped quantity. Always starts at 0. |
| `minimumQuantity` | `Quantity` | yes | Integer, nonnegative. Low-stock threshold. Defaults to 0. |
| `createdAt` | datetime | persistence | Returned by read models. |
| `updatedAt` | datetime | persistence | Returned by read models. |

### Derived (read model only)

| Field | Type | Notes |
|-------|------|-------|
| `belowMinimum` | boolean | `availableQuantity < minimumQuantity`. Informational; does not block operations. |

### Invariants

- `organizationId`, `productId` must be nonblank.
- `availableQuantity`, `reservedQuantity`, `minimumQuantity` are integers and never negative.
- At most one `InventoryItem` exists per `(organizationId, productId)`.
- `reserve` cannot move more than `availableQuantity`.
- `releaseReservation` cannot move more than `reservedQuantity`.
- `confirmStockOut` cannot remove more than `reservedQuantity`.
- Inventory operations never mutate `Product`.

### Domain Methods

| Method | Precondition | Effect | Movement |
|--------|--------------|--------|----------|
| `addStock(quantity, reason)` | `quantity` integer > 0 | `availableQuantity += quantity` | `IN` (quantity) |
| `reserve(quantity, reason)` | `quantity` integer > 0 and `quantity <= availableQuantity` | `availableQuantity -= quantity`; `reservedQuantity += quantity` | `RESERVE` (quantity) |
| `releaseReservation(quantity, reason)` | `quantity` integer > 0 and `quantity <= reservedQuantity` | `reservedQuantity -= quantity`; `availableQuantity += quantity` | `RELEASE` (quantity) |
| `confirmStockOut(quantity, reason)` | `quantity` integer > 0 and `quantity <= reservedQuantity` | `reservedQuantity -= quantity` | `OUT` (quantity) |
| `adjustStock(quantity, reason)` | `quantity` integer >= 0 (new absolute value) | `availableQuantity = quantity`; `reservedQuantity` unchanged | `ADJUSTMENT` (quantity) |

Each successful method buffers exactly one `InventoryMovementDraft { type, quantity, reason }`. Failed preconditions throw `DomainValidationError` and buffer nothing. The aggregate exposes `pullMovements()` to return and clear buffered drafts.

### State Transitions (creation)

| Operation | Result |
|-----------|--------|
| Create with `availableQuantity = 0` | Position created; `reservedQuantity = 0`; no movement. |
| Create with `availableQuantity > 0` | Position created; one opening `IN` movement recorded for the initial quantity. |

## InventoryMovement

Append-only audit Entity inside the `InventoryItem` aggregate boundary.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Stable movement identifier. |
| `organizationId` | string | yes | Tenant owner. |
| `inventoryItemId` | string | yes | Parent position. |
| `productId` | string | yes | Product the movement refers to. |
| `type` | `InventoryMovementType` | yes | One allowed enum value. |
| `quantity` | `Quantity` | yes | Integer, nonnegative magnitude; direction conveyed by `type`. |
| `reason` | string or null | no | Optional note; blank input normalized to null. |
| `createdByUserId` | string | yes | User who performed the action (request-supplied in this phase). |
| `createdAt` | datetime | persistence | Set on insert; returned by read models. |

### Rules

- Append-only: no update, no delete operations exist.
- Exactly one movement is created per successful `addStock`/`reserve`/`releaseReservation`/`confirmStockOut`/`adjustStock`, plus one opening `IN` movement when a position is created with `availableQuantity > 0`.
- `createdByUserId` is required and nonblank.
- No RBAC is enforced in this spec.

## Enums

### InventoryMovementType

- `IN`
- `OUT`
- `RESERVE`
- `RELEASE`
- `ADJUSTMENT`

## Value Objects

### Quantity (shared)

- Integer only; non-integer input is rejected.
- Nonnegative; negative input is rejected.
- Located at `packages/api/src/shared/domain/value-objects/Quantity.ts`, mirroring `MoneyInCents`.
- Reused by `InventoryItem` quantities and `InventoryMovement.quantity`.

## Relationships

- `Organization` 1:N `InventoryItem`.
- `Product` 1:1 `InventoryItem` (at most one position per product in this phase).
- `InventoryItem` 1:N `InventoryMovement`.
- `InventoryMovement.organizationId` and `InventoryMovement.productId` are stored as scalar, indexed columns; `createdByUserId` is a scalar column without a foreign-key relation (mirrors `OrganizationDocumentApprovalLog.organizationUserId`).
- No relation to batches, lots, expiration, orders, order-bound reservations, prescriptions, checkout, payments, uploads, images, multiple stocks, or transfers in this feature.

## Read Models

### InventoryItemReadModel

Returned by create, get, add-stock, reserve, release-reservation, confirm-stock-out, and adjust use cases.

Fields:

- `id`
- `organizationId`
- `productId`
- `availableQuantity`
- `reservedQuantity`
- `minimumQuantity`
- `belowMinimum`
- `createdAt`
- `updatedAt`

### InventoryMovementReadModel

Returned by the list-movements use case.

Fields:

- `id`
- `organizationId`
- `inventoryItemId`
- `productId`
- `type`
- `quantity`
- `reason`
- `createdByUserId`
- `createdAt`

## Repository Contract

The persistence contract is split into two repositories (one per concern), each organization- and product-scoped. `InventoryItem` remains the Aggregate Root; the movement repository only appends and queries the append-only audit trail. Both writes for a single operation run inside the same `UnitOfWork` so the position and its movement persist atomically.

`InventoryItemRepository`:

- `findByProductInOrganization(organizationId, productId): Promise<InventoryItem | null>` (domain, for mutations)
- `findDetailsByProductInOrganization(organizationId, productId): Promise<InventoryItemReadModel | null>` (read model)
- `existsForProduct(organizationId, productId): Promise<boolean>`
- `create(item: InventoryItem): Promise<InventoryItemReadModel>`
- `save(item: InventoryItem): Promise<InventoryItemReadModel>`

`InventoryMovementRepository`:

- `append(movements: InventoryMovement[]): Promise<void>`
- `listByProductInOrganization(organizationId, productId): Promise<InventoryMovementReadModel[]>` (ordered by `createdAt` desc)

Neither repository exposes unscoped inventory reads for API use cases, and the movement repository provides no update/delete operations.

## Persistence Notes

- Prisma `InventoryItem` model: `inventory_items` table, `@@unique([organizationId, productId])`, `@@index([organizationId])`, integer quantity columns defaulting to 0, relation to `Organization` and `Product`.
- Prisma `InventoryMovement` model: `inventory_movements` table, `type` using the `InventoryMovementType` enum, `quantity` integer, `reason` nullable, `createdByUserId` scalar string, `createdAt` default now, relation to `InventoryItem`, `@@index([organizationId, productId])` and `@@index([inventoryItemId])`.
- Product existence is validated through the existing `ProductRepository`; inventory never writes to the `products` table.

# Data Model: CRUD Backend de Produtos da Organizacao

## Product

Aggregate Root for an organization product catalog item.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Stable product identifier. |
| `organizationId` | string | yes | Tenant owner. Must be present for every product. |
| `name` | string | yes | Trimmed; cannot be blank. |
| `description` | string or null | no | Optional free text; blank input should be normalized to null/absent. |
| `category` | `ProductCategory` | yes | Must be one allowed enum value. |
| `type` | `ProductType` | yes | Must be one allowed enum value. |
| `strainType` | `StrainType` or null | no | Optional; must be one allowed enum value when present. |
| `thcPercentage` | number or null | no | Optional; must be nonnegative when present. Zero is allowed. |
| `cbdPercentage` | number or null | no | Optional; must be nonnegative when present. Zero is allowed. |
| `unit` | `ProductUnit` | yes | Must be one allowed enum value. |
| `priceInCents` | `MoneyInCents` | yes | Integer cent amount; cannot be negative. |
| `isActive` | boolean | yes | Defaults to true on creation. |
| `createdAt` | datetime | persistence | Returned by read models. |
| `updatedAt` | datetime | persistence | Returned by read models. |

### Validation Rules

- `organizationId` must be nonblank.
- `name` must be nonblank after trimming.
- `category` must be one of `FLOWER`, `OIL`, `EXTRACT`, `CAPSULE`, `EDIBLE`, `TOPICAL`, `VAPORIZER`, `ACCESSORY`, `OTHER`.
- `type` must be one of `CBD`, `THC`, `BALANCED`, `FULL_SPECTRUM`, `BROAD_SPECTRUM`, `ISOLATE`.
- `strainType`, when present, must be one of `INDICA`, `SATIVA`, `HYBRID`.
- `unit` must be one of `GRAM`, `MILLILITER`, `UNIT`.
- `priceInCents` must be an integer number of cents and nonnegative via `MoneyInCents`.
- `thcPercentage` and `cbdPercentage`, when present, must be nonnegative numbers.
- `description`, when omitted, null, or blank after trim, is treated as absent.
- Created products start with `isActive = true` unless rehydrated from persistence with an explicit value.

### State Transitions

| Operation | Current State | Result |
|-----------|---------------|--------|
| Create | none | Product is created with `isActive = true`. |
| Update catalog data | active or inactive | Product catalog fields are replaced after validation; `organizationId` and `id` are preserved. |
| Activate | active or inactive | `isActive = true`; operation is idempotent. |
| Deactivate | active or inactive | `isActive = false`; operation is idempotent. |
| Delete | active or inactive | Soft delete; same result as deactivate. |

## Enums

### ProductCategory

- `FLOWER`
- `OIL`
- `EXTRACT`
- `CAPSULE`
- `EDIBLE`
- `TOPICAL`
- `VAPORIZER`
- `ACCESSORY`
- `OTHER`

### ProductType

- `CBD`
- `THC`
- `BALANCED`
- `FULL_SPECTRUM`
- `BROAD_SPECTRUM`
- `ISOLATE`

### StrainType

- `INDICA`
- `SATIVA`
- `HYBRID`

### ProductUnit

- `GRAM`
- `MILLILITER`
- `UNIT`

## Relationships

- `Organization` 1:N `Product`.
- `Product.organizationId` references `Organization.id`.
- No relation to inventory, stock items, stock movements, orders, reservations, prescriptions, images, uploads, custom categories, or payments in this feature.

## Read Models

### ProductReadModel

Returned by create, list, get, update, delete, activate, and deactivate use cases.

Fields:

- `id`
- `organizationId`
- `name`
- `description`
- `category`
- `type`
- `strainType`
- `thcPercentage`
- `cbdPercentage`
- `unit`
- `priceInCents`
- `isActive`
- `createdAt`
- `updatedAt`

## Repository Contract

`ProductRepository` should expose organization-scoped methods:

- `findByIdInOrganization(organizationId, productId): Promise<Product | null>`
- `findDetailsByIdInOrganization(organizationId, productId): Promise<ProductReadModel | null>`
- `findAllByOrganization(organizationId): Promise<ProductReadModel[]>`
- `create(product): Promise<ProductReadModel>`
- `save(product): Promise<ProductReadModel>`

The repository must not expose unscoped product reads for API use cases.

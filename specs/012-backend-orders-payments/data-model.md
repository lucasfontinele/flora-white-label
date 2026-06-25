# Data Model: Pedidos e Pagamentos no Backend (Orders & Payments)

## Order

Aggregate Root for a patient's product order within an organization.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Stable order identifier. |
| `organizationId` | string | yes | Tenant owner. Required for every order. |
| `token` | string | yes | Backend-generated, human-readable, unique per organization (e.g. `ORD-7F3K9A`). |
| `patientId` | string | yes | Patient the order belongs to. Must exist in the organization. |
| `guardianId` | string or null | no | Optional responsavel; when present must match the patient's `guardianId`. |
| `status` | `OrderStatus` | yes | Starts at `REQUESTED`. |
| `deliveryType` | `OrderDeliveryType` | yes | `CORREIOS` or `PICKUP`. |
| `itemsAmount` | integer | yes | Sum of all item quantities. Derived from items. |
| `createdAt` | datetime | persistence | Returned by read models. |
| `updatedAt` | datetime | persistence | Returned by read models. |

### Children

| Relation | Type | Notes |
|----------|------|-------|
| `items` | `OrderItem[]` | At least one. Owned by the aggregate; created with the order. |

### Invariants

- `organizationId`, `patientId` must be nonblank.
- `token` is nonblank, readable, unique per `(organizationId, token)`.
- At least one `OrderItem` is required.
- `itemsAmount` equals the sum of `item.quantity` across items.
- `status` starts at `REQUESTED`.
- When `guardianId` is provided it must equal the patient's `guardianId`.
- A `CANCELLED` order cannot change status, items, or accept new payments.
- Order creation never reserves or decrements inventory.

### Domain Methods

| Method | Precondition | Effect |
|--------|--------------|--------|
| `Order.create({ organizationId, patientId, guardianId?, deliveryType, items[] }, id?)` | >= 1 item; valid delivery type; each item valid | Generates `token`, sets `status = REQUESTED`, builds `OrderItem`s with frozen `unitPrice`, computes `itemsAmount`. |
| `cancel()` | order not already `CANCELLED` | Sets `status = CANCELLED`. |
| `ensureMutable()` (guard) | order not `CANCELLED` | Throws `DomainValidationError` when cancelled; used to block changes/payments. |

`Order.create` is the only place items are added in this phase (no add/remove item endpoints). The full status workflow is intentionally not implemented; only `cancel()` is required (basic status method per the spec).

## OrderItem

Entity inside the `Order` aggregate boundary. Price is frozen at order creation.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Stable item identifier. |
| `orderId` | string | yes | Parent order. |
| `productId` | string | yes | Product referenced. Must exist, be active, and belong to the same organization. |
| `unitPrice` | `MoneyInCents` | yes | Integer cents. Frozen from the product price at creation; never recalculated from the catalog. |
| `quantity` | `Quantity` (positive) | yes | Integer > 0. |

### Invariants

- `productId` must be nonblank.
- `unitPrice` is integer cents, nonnegative (`MoneyInCents`).
- `quantity` is an integer strictly greater than zero.
- The product must exist in the order's organization and be active (validated by the application before constructing the item).
- If a patient product-access rule exists in the project, the product must be released to the patient. No such rule exists today, so this check is a documented extension point and does not block in this phase.

## OrderPayment

Simple Aggregate Root for a payment attempt of an order, integrated with AbacatePay.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Stable payment identifier. |
| `orderId` | string | yes | Order being paid. |
| `totalPaid` | `MoneyInCents` | yes | Integer cents. `round(grossAmount * (1 - discount))`. |
| `discount` | decimal `[0.01, 1]` or null | no | Discount percentage. Absent = no discount. |
| `paymentMethod` | `PaymentMethod` | yes | `CREDIT_CARD`, `BOLETO`, `PIX`. |
| `status` | `PaymentStatus` | yes | Starts at `PENDING`. |
| `externalPaymentId` | string or null | no | AbacatePay reference (transparent/checkout id). |
| `checkoutUrl` | string or null | no | Hosted checkout URL (card). |
| `pixQrCode` | string or null | no | PIX `brCode` copia-e-cola. |
| `pixQrCodeBase64` | string or null | no | PIX `brCodeBase64` PNG. |
| `expiresAt` | datetime or null | no | PIX/checkout expiration when provided by the gateway. |
| `createdAt` | datetime | persistence | Returned by read models. |
| `updatedAt` | datetime | persistence | Returned by read models. |

### Invariants

- `orderId` must be nonblank.
- `totalPaid` is integer cents, nonnegative.
- `discount`, when present, is a decimal between `0.01` and `1`.
- `paymentMethod` is required and a valid enum value.
- `status` starts at `PENDING`.
- No secret/token/credential of the gateway is ever stored on or returned from the payment.

### Domain Methods

| Method | Precondition | Effect |
|--------|--------------|--------|
| `OrderPayment.create({ orderId, totalPaid, discount?, paymentMethod }, id?)` | valid amount, discount range, method | Builds payment with `status = PENDING`. |
| `attachGatewayReference({ externalPaymentId, checkoutUrl?, pixQrCode?, pixQrCodeBase64?, expiresAt? })` | payment is `PENDING` | Stores gateway references (no secrets). |
| `syncStatus(newStatus)` | `externalPaymentId` present | Sets `status` to the mapped `PaymentStatus`. |

## Enums

### OrderStatus

`REQUESTED`, `UNDER_REVIEW`, `IN_SEPARATION`, `APPROVED`, `READY_FOR_PICKUP`, `SHIPPED`, `DELIVERED`, `CANCELLED`.

### OrderDeliveryType

`CORREIOS`, `PICKUP`.

### PaymentMethod

`CREDIT_CARD`, `BOLETO`, `PIX`.

### PaymentStatus

`PENDING`, `EXPIRED`, `CANCELLED`, `PAID`, `UNDER_DISPUTE`, `REFUNDED`, `REDEEMED`, `APPROVED`, `FAILED`.

## Value Objects (reused)

### MoneyInCents (shared, existing)

- Integer cents, nonnegative. Reused by `OrderItem.unitPrice` and `OrderPayment.totalPaid`.

### Quantity (shared, existing)

- Integer, nonnegative. `OrderItem.quantity` additionally requires strictly positive (validated by the item/use case).

### DiscountRate (shared, new — optional)

- Decimal in `[0.01, 1]`. Validates the discount percentage. Mirrors `MoneyInCents` precision philosophy. Absence means "no discount".

## Application Port

### PaymentGatewayService (application)

```ts
interface CreatePaymentGatewayInput {
  orderId: string;
  organizationId: string;
  paymentMethod: PaymentMethod;
  amountInCents: number;        // totalPaid
  description?: string;
  customer?: { name?: string; email?: string; taxId?: string; cellphone?: string };
  metadata?: Record<string, string>;
}

interface CreatePaymentGatewayOutput {
  externalPaymentId: string;
  checkoutUrl?: string | null;
  pixQrCode?: string | null;
  pixQrCodeBase64?: string | null;
  expiresAt?: Date | null;
  status: PaymentStatus;        // mapped initial status (normally PENDING)
}

interface PaymentGatewayStatusOutput {
  status: PaymentStatus;        // mapped from gateway
}

interface PaymentGatewayService {
  createPayment(input: CreatePaymentGatewayInput): Promise<CreatePaymentGatewayOutput>;
  getPaymentStatus(externalPaymentId: string): Promise<PaymentGatewayStatusOutput>;
}
```

The port exposes only non-sensitive data. AbacatePay specifics (endpoints, Bearer token, response envelope) are entirely inside `AbacatePayPaymentGatewayService`.

## Relationships

- `Organization` 1:N `Order`.
- `Patient` 1:N `Order`; `Guardian` 0:N `Order` (optional).
- `Order` 1:N `OrderItem`.
- `Order` 1:N `OrderPayment`.
- `OrderItem.productId` references `Product` (read-only: order never mutates `Product`).
- `OrderPayment` references `Order` by `orderId`; gateway references are scalar columns (no FK to AbacatePay).
- No relation to inventory (no reservation/decrement), prescriptions, shipping, invoices, e-mail, splits, or refunds in this feature.

## Read Models

### OrderReadModel

Returned by create, get and cancel use cases (with `items`); list returns the same without `items` (summary) unless the contract states otherwise.

Fields: `id`, `organizationId`, `token`, `patientId`, `guardianId`, `status`, `deliveryType`, `itemsAmount`, `items` (in detail views), `createdAt`, `updatedAt`.

### OrderItemReadModel

Fields: `id`, `orderId`, `productId`, `unitPrice` (cents), `quantity`.

### OrderPaymentReadModel

Returned by create, list, get and sync-status use cases.

Fields: `id`, `orderId`, `totalPaid`, `discount`, `paymentMethod`, `status`, `externalPaymentId`, `checkoutUrl`, `pixQrCode`, `pixQrCodeBase64`, `expiresAt`, `createdAt`, `updatedAt`. Never includes gateway secrets.

## Repository Contracts

`OrderRepository`:

- `findByIdInOrganization(organizationId, orderId): Promise<Order | null>` (domain, for mutation/cancel)
- `findDetailsByIdInOrganization(organizationId, orderId): Promise<OrderReadModel | null>` (read model with items)
- `findAllByOrganization(organizationId): Promise<OrderReadModel[]>` (summary read models)
- `existsByToken(organizationId, token): Promise<boolean>` (token uniqueness pre-check / retry support)
- `create(order: Order): Promise<OrderReadModel>` (persists order + items atomically)
- `save(order: Order): Promise<OrderReadModel>` (e.g. cancel)

`OrderPaymentRepository`:

- `findByIdInOrderInOrganization(organizationId, orderId, paymentId): Promise<OrderPayment | null>` (domain)
- `findDetailsByIdInOrderInOrganization(organizationId, orderId, paymentId): Promise<OrderPaymentReadModel | null>` (read model)
- `findAllByOrderInOrganization(organizationId, orderId): Promise<OrderPaymentReadModel[]>`
- `existsPaidForOrder(organizationId, orderId): Promise<boolean>` (block new payment when already PAID/APPROVED)
- `create(payment: OrderPayment): Promise<OrderPaymentReadModel>`
- `save(payment: OrderPayment): Promise<OrderPaymentReadModel>`

All reads are scoped by `organizationId` (and `orderId` for payments). No unscoped reads are exposed for API use cases.

## Persistence Notes (Prisma)

- `Order` model -> `orders` table: `token` String, `status` `OrderStatus`, `deliveryType` `OrderDeliveryType`, `itemsAmount` Int, `patientId`/`guardianId?` scalar columns with relations to `Patient`/`Guardian`, relation to `Organization`, `items` `OrderItem[]`, `payments` `OrderPayment[]`. `@@unique([organizationId, token])`, `@@index([organizationId])`, `@@index([organizationId, patientId])`.
- `OrderItem` model -> `order_items` table: `orderId`, `productId`, `unitPriceInCents` Int, `quantity` Int, relation to `Order` and `Product`. `@@index([orderId])`.
- `OrderPayment` model -> `order_payments` table: `orderId`, `totalPaidInCents` Int, `discount` `Decimal(3,2)?`, `paymentMethod` `PaymentMethod`, `status` `PaymentStatus`, `externalPaymentId` String?, `checkoutUrl` String?, `pixQrCode` String?, `pixQrCodeBase64` String?, `expiresAt` DateTime?, relation to `Order`. `@@index([orderId])`, `@@index([organizationId])` (denormalized `organizationId` column for tenant-scoped reads).
- New enums: `OrderStatus`, `OrderDeliveryType`, `PaymentMethod`, `PaymentStatus`.
- Money columns use the `...InCents` Int convention already used by `Product.priceInCents`. The domain props are `unitPrice`/`totalPaid` (`MoneyInCents`); getters expose `unitPriceInCents`/`totalPaidInCents` for mappers.
- Forward-only migration; never edit an applied migration.
- No gateway secret column exists; only non-sensitive references are persisted.

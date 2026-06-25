# Research: Pedidos e Pagamentos no Backend (Orders & Payments)

## Decision: Create a new `orders` bounded module containing Order, OrderItem and OrderPayment

**Rationale**: Orders, their items and their payments form a single purchase lifecycle. The repo convention is `packages/api/src/modules/<domain>/{domain,application,infrastructure,presentation}`, and the `inventory` module already proves that a module can host an Aggregate Root plus a closely related entity. `Order` is the Aggregate Root, `OrderItem` is a child Entity inside the `Order` boundary, and `OrderPayment` is a simple Aggregate Root that references the order by `orderId`. Keeping all three in one module mirrors the always-nested routing (`/orders/:orderId/payments`) and avoids a premature cross-module split.

**Alternatives considered**:

- Separate `payments` module: rejected for now because payments have no lifecycle independent of an order in this phase and every payment route is nested under an order. A future split is easy if payments grow (refunds, splits, payouts).
- Put `OrderItem` and `OrderPayment` under `products`/`inventory`: rejected; they are distinct aggregates and would blur consistency boundaries.

## Decision: `Order` is the Aggregate Root and `OrderItem` lives inside its boundary

**Rationale**: The spec mandates `Order` as Aggregate Root and `OrderItem` as an Entity within the aggregate. `AggregateRoot`/`Entity` already exist in `shared/domain/entities`. The aggregate owns the invariants "at least one item", "`itemsAmount` = sum of item quantities", "starts `REQUESTED`", "readable `token`", and "cancelled order cannot change". Items are created together with the order and never loaded for standalone mutation in this phase.

**Alternatives considered**:

- Make `OrderItem` its own aggregate/repository: rejected because items have no lifecycle independent of the order and must be created atomically with it.
- Make `Order` a plain Entity: rejected; it conflicts with the spec and weakens the invariant boundary.

## Decision: `OrderPayment` is a simple Aggregate Root referencing `orderId`

**Rationale**: Payments are queried and synchronized on their own (`GET .../payments/:paymentId`, `PATCH .../payments/:paymentId/sync-status`), so they need their own identity and repository. Modeling `OrderPayment` as a simple Aggregate Root (analogous to how `InventoryItem` is a focused root) keeps payment status transitions and gateway-reference fields cohesive without entangling them inside the `Order` load path. The `Order` aggregate is not mutated when a payment is created/synced in this phase.

**Alternatives considered**:

- Nest `OrderPayment` inside the `Order` aggregate: rejected because it would force loading the whole order to read/sync a single payment and would couple payment status to order persistence.
- Model payments as a separate aggregate with full bidirectional consistency to order status: rejected as out of scope; order status is not derived from payments in this phase (`sync-status` does not change `Order`).

## Decision: AbacatePay is integrated behind a `PaymentGatewayService` port (application) implemented in infrastructure

**Rationale**: The domain must not know about AbacatePay (FR-049). The application defines the port:

```ts
interface PaymentGatewayService {
  createPayment(input: CreatePaymentGatewayInput): Promise<CreatePaymentGatewayOutput>;
  getPaymentStatus(externalPaymentId: string): Promise<PaymentGatewayStatusOutput>;
}
```

`AbacatePayPaymentGatewayService` (infrastructure) implements it with an injectable `fetchFn`, base URL and API key, exactly like `TurnstileCaptchaVerifier` already does for outbound HTTP. Use cases depend only on the port, so AbacatePay can be swapped or faked in tests.

**Alternatives considered**:

- Call AbacatePay from the use case directly: rejected; it would couple application to a vendor and to HTTP.
- Put the gateway client in the domain: rejected; violates clean layering.

## Decision: Method-to-AbacatePay mapping per ABACATE_INTEGRATION.md

The `ABACATE_INTEGRATION.md` file states: base URL `https://api.abacatepay.com/v2`, `Authorization: Bearer <api-key>`, amounts in cents, response envelope `{ data, success, error }`. Mapping:

| `paymentMethod` | AbacatePay flow | Create endpoint | Persisted references | Status endpoint |
|-----------------|-----------------|-----------------|----------------------|-----------------|
| `PIX` | Checkout Transparente (PIX embutido, sem redirect) | `POST /transparents/create` (`data.amount` em centavos, `data.expiresIn`, `data.customer`, `data.metadata`) | `externalPaymentId` (id retornado), `pixQrCode` (`brCode` copia-e-cola), `pixQrCodeBase64` (`brCodeBase64` PNG), `expiresAt` | `GET /transparents/check` (por id) |
| `CREDIT_CARD` | Checkout hospedado (redirect) | `POST /checkouts/create` (`items`/amount, `methods: ["CARD"]`, `returnUrl`/`completionUrl`, `externalId`, `metadata`) | `externalPaymentId` (id), `checkoutUrl` (`url` retornada) | `GET /checkouts/one` (por id) |
| `BOLETO` | Nao documentado no arquivo (apenas PIX/CARD) | — | — | — |

**Rationale**: The integration doc only documents PIX (transparent) and CARD (hosted checkout). PIX is the lowest-friction path (QR generated immediately, no redirect), and CARD requires the hosted checkout URL. `BOLETO` is kept in the `PaymentMethod` enum (the spec requires the enum values) but the gateway adapter returns a structured "payment method not supported by gateway" error for it in this phase, so no inconsistent payment is created (FR-053).

**Alternatives considered**:

- Force everything through the hosted Checkout (`/checkouts/create`): rejected because PIX-transparent gives an embeddable QR without redirect, which is the better backend contract for a portal.
- Implement `BOLETO` against an undocumented endpoint: rejected; the integration file does not document boleto, so guessing the contract risks an incorrect integration.

## Decision: No webhook in this phase; status sync via `sync-status` polling

**Rationale**: The user excludes webhooks "salvo se o arquivo exigir como minimo". `ABACATE_INTEGRATION.md` documents webhooks as optional notifications and also documents pull endpoints (`GET /transparents/check`, `GET /checkouts/one`) that return current status. Because status is obtainable by polling, webhooks are not the minimum, so they stay out of scope. The `PATCH .../payments/:paymentId/sync-status` endpoint calls `getPaymentStatus(externalPaymentId)` on demand and maps the result to `PaymentStatus`.

**Alternatives considered**:

- Implement signed HMAC webhook receiver now: rejected as out of scope and not required by the integration file for basic operation.

## Decision: Gateway status -> `PaymentStatus` mapping is deterministic and documented

**Rationale**: AbacatePay statuses/events (`PENDING`, `EXPIRED`, `CANCELLED`, `PAID`, `REFUNDED`, plus checkout events `completed`, `refunded`, `disputed`, `lost`) are mapped to the local `PaymentStatus` enum in the infrastructure adapter (FR-055). Proposed mapping:

| AbacatePay status/event | `PaymentStatus` |
|-------------------------|-----------------|
| `PENDING` | `PENDING` |
| `PAID` / `completed` | `PAID` |
| `EXPIRED` / `lost` | `EXPIRED` |
| `CANCELLED` | `CANCELLED` |
| `REFUNDED` / `refunded` | `REFUNDED` |
| `disputed` | `UNDER_DISPUTE` |
| unknown / unmapped | `FAILED` (fail-safe, logged without secrets) |

`APPROVED`, `REDEEMED` and `FAILED` remain valid local values (required by the spec enum) for future gateway states; `APPROVED` may be used as an alias of `PAID` if a future gateway distinguishes authorization from capture. The mapping lives only in infrastructure; domain/application treat `PaymentStatus` opaquely.

**Alternatives considered**:

- Store the raw gateway status string: rejected; the spec defines a closed `PaymentStatus` enum, and a typed mapping is safer for consumers.

## Decision: `discount` is a percentage in `[0.01, 1]`; `totalPaid` is computed in cents

**Rationale**: The spec defines `discount` as a decimal between `0.01` and `1` representing a discount percentage. Gross amount is `sum(item.unitPriceInCents * quantity)`. `totalPaid = round(gross * (1 - discount))`, kept as an integer number of cents via `MoneyInCents`. A `DiscountRate` value object enforces the `0.01..1` range (or absence), mirroring the precision philosophy of `MoneyInCents`/`Quantity`. `discount` persists as a Prisma `Decimal(3,2)` to avoid float drift; `totalPaid` persists as `Int` cents.

**Alternatives considered**:

- Treat `discount` as the fraction to pay: rejected; the field is named "discount" and the rule says it represents the discount percentage, so it reduces the amount.
- Store discount as Float: rejected in favor of `Decimal(3,2)` for exactness in the `0.01..1` band; the existing `Float` columns are for THC/CBD percentages, not money math.

## Decision: Freeze `unitPrice` from the product at order creation

**Rationale**: FR-023 requires the item price to be frozen at order time. `CreateOrderUseCase` reads each product via the existing `ProductRepository.findByIdInOrganization` (organization-scoped, returns the domain `Product` with `priceInCents`), validates it exists/active/same-org, and copies `priceInCents` into the `OrderItem.unitPrice` (`MoneyInCents`). Later catalog price changes never affect existing items because the value is persisted on the item.

**Alternatives considered**:

- Reference the product price live at read time: rejected; it breaks price-freezing and historical accuracy.

## Decision: Validate patient existence and guardian linkage by reuse; no new RBAC

**Rationale**: `CreateOrderUseCase` validates the patient via `PatientRepository.findDetailsByIdInOrganization` (organization-scoped, returns `guardianId`). When `guardianId` is provided in the request, it must equal the patient's `guardianId` (the responsavel). This reuses the existing access model (`User -> Member(Responsavel) -> Patient`) without adding a guardian-by-id lookup or any RBAC. No authentication, cookies, or IronSession are introduced.

**Alternatives considered**:

- Add `GuardianRepository.findByIdInOrganization`: possible but rejected to keep the change minimal; the patient already carries the authoritative `guardianId`. If a future need arises, the lookup can be added.
- Derive the actor from a session: out of scope (no auth changes in this spec).

## Decision: Readable `token` generated by the domain, unique per organization

**Rationale**: FR-010 requires a backend-generated readable token. The `Order` aggregate generates a short uppercase token (e.g. prefix `ORD-` + 6 Crockford-base32 chars from `node:crypto` randomness; `node:crypto` is already used by the base `Entity` for `randomUUID`). Uniqueness is enforced by a `@@unique([organizationId, token])` Prisma constraint; on the rare insert conflict the use case regenerates and retries, surfacing only a structured error if it persistently fails.

**Alternatives considered**:

- Sequential per-organization counter: rejected as it needs a separate counter row/locking and leaks order volume.
- Plain UUID as token: rejected; not human-readable for patient support.

## Decision: Atomic persistence in one Unit of Work

**Rationale**: Order + its items must commit together, and a payment + its gateway references must commit together (FR-065). Each write use case runs inside `PrismaTransactionManager.execute`. For payment creation, the gateway call happens, then the local payment is persisted with the returned references in a single transaction; a gateway failure aborts before persistence so no orphan/inconsistent payment remains (US4 scenario 6).

**Alternatives considered**:

- Persist a `PENDING` payment first, then call the gateway, then update: rejected for this phase to avoid orphan local payments on gateway failure; the simpler "call then persist" keeps state consistent. (A future webhook-driven design may invert this.)

## Decision: Env validated with Zod in `config/env.ts`

**Rationale**: FR-054 requires Zod-validated AbacatePay envs. Following the existing `requiredInProduction(name, fallback)` pattern in `config/env.ts`, add `ABACATEPAY_API_KEY` (required in production, safe dev default) and `ABACATEPAY_BASE_URL` (default `https://api.abacatepay.com/v2`). Secrets are never echoed in responses or logs.

**Alternatives considered**:

- Read `process.env` inside the adapter: rejected; the repo centralizes and validates env with Zod for fail-fast startup.

## Decision: Zod in presentation only; document the contract in OpenAPI

**Rationale**: Current route files define Zod + JSON schemas in `presentation/http/*-schemas.ts` and `safeParse` in handlers, while domain/application stay framework-agnostic. Orders/payments follow this pattern, with the external HTTP contract documented in `contracts/backend-orders-payments.openapi.yaml`, consistent with the product/inventory features.

**Alternatives considered**:

- Pass Zod schemas into use cases: rejected; application/domain must not depend on Zod.

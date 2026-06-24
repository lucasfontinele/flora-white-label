# Implementation Plan: Pedidos e Pagamentos no Backend (Orders & Payments)

**Branch**: `(spec directory 012-backend-orders-payments)` | **Date**: 2026-06-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/012-backend-orders-payments/spec.md`

## Summary

Build an API-only backend slice for patient orders and their payments, integrated with AbacatePay. The feature introduces a new `orders` bounded module in `packages/api` with `Order` as an Aggregate Root, `OrderItem` as a child Entity inside the aggregate, and `OrderPayment` as a simple Aggregate Root. It adds the `OrderStatus`, `OrderDeliveryType`, `PaymentMethod`, and `PaymentStatus` enums, a `PaymentGatewayService` application port with an `AbacatePayPaymentGatewayService` infrastructure implementation, Prisma persistence, application use cases, Fastify routes, Zod validation, OpenAPI contract documentation, and focused tests.

The slice stops at order creation/listing/reading/cancellation and payment creation/listing/reading/status-sync. It does not implement frontend, visual cart, frontend checkout, cookies/IronSession, new authentication, new RBAC, Correios integration, real freight, inventory reservation/decrement, payment split, real refund, invoice, e-mail, prescriptions-as-entity, or webhooks. It reads `Product` to freeze item prices and validate availability but never mutates `Product` or inventory.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js runtime, ES2022 target, NodeNext module resolution.

**Primary Dependencies**: `packages/api` uses Fastify 5.8.5, Prisma 6.19.3, PostgreSQL, Zod 4.4.3, Vitest 4.1.9, the global `fetch` for outbound HTTP (already used by `TurnstileCaptchaVerifier`), and shared domain/application helpers in an existing pnpm monorepo.

**Storage**: PostgreSQL through Prisma. New models `Order`, `OrderItem`, `OrderPayment` related to `Organization`, `Patient`, `Guardian`, and `Product`. No file/object storage.

**External Integration**: AbacatePay REST API (`https://api.abacatepay.com/v2`, Bearer token, amounts in cents, `{ data, success, error }` envelope), per `ABACATE_INTEGRATION.md`. PIX -> `POST /transparents/create` + `GET /transparents/check`; CARD -> `POST /checkouts/create` + `GET /checkouts/one`. Encapsulated in `AbacatePayPaymentGatewayService`.

**Testing**: Vitest unit tests for domain invariants, use cases with in-memory fakes and a fake `PaymentGatewayService`, schema tests for Zod payloads/params, an `AbacatePayPaymentGatewayService` test with an injectable `fetchFn` (mirroring `TurnstileCaptchaVerifier.test.ts`), and an HTTP route placeholder consistent with `product-routes.test.ts`. Validation gates: `pnpm prisma:generate`, `pnpm typecheck:api`, `pnpm --filter @flora/api lint`, `pnpm test:api`, `pnpm build:api`.

**Target Platform**: Fastify API runtime only.

**Project Type**: pnpm monorepo, API-only change under `packages/api` plus feature documentation under `specs/012-backend-orders-payments`.

**Performance Goals**: 95% of order create/list/get/cancel and payment create/list/get/sync operations complete in under 1 second in dev/homologation for normal catalog/order sizes (excluding AbacatePay network latency, which is bounded by an adapter timeout).

**Constraints**: Do not alter `packages/web`. Do not implement frontend, visual cart, frontend checkout, cookies, IronSession, new auth, new RBAC, Correios, real freight, inventory reservation/decrement, split, real refund, invoice, e-mail, prescriptions-as-entity, webhooks, or unrelated refactors. Domain must not depend on Prisma, Fastify, Zod, AbacatePay, or HTTP. Application must depend on repository interfaces and the `PaymentGatewayService` port, not on Prisma or AbacatePay. Orders must never write `Product` or inventory. No gateway secret may appear in responses or logs.

**Scale/Scope**: One new API module; four enums; one `Order` aggregate with `OrderItem`; one `OrderPayment` aggregate; one optional `DiscountRate` value object; one `PaymentGatewayService` port; one `AbacatePayPaymentGatewayService` adapter; two repository interfaces with read models; Prisma mappers and repositories; use cases for create/list/get/cancel order and create/list/get/sync payment; presenters; Zod schema file; Fastify route files; a composition factory; three Prisma models plus four enums and one migration; route registration; env additions; OpenAPI contract; and focused tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: PASS. Implementation is limited to `packages/api`, `packages/api/prisma`, and feature documentation. `packages/web` remains untouched.
- **Shared Contracts**: PASS. Order/payment payloads, responses, enums, route shapes, and structured errors are documented in `contracts/backend-orders-payments.openapi.yaml`. Types remain package-local because no frontend/shared consumer is implemented in this backend-only slice.
- **Tenant Isolation**: PASS. `Order`, `OrderItem`, and `OrderPayment` carry/scope by `organizationId`. Every route includes `:organizationId`; repositories query by `{ organizationId, ... }`. Cross-organization access returns not found.
- **Clean Layering**: PASS. Domain owns order/item/payment invariants and the readable token; application owns orchestration, product/patient/guardian checks via interfaces, discount math, and the gateway port; infrastructure owns Prisma repositories/mappers and the AbacatePay adapter; presentation owns Fastify routes, Zod parsing, JSON schema, and HTTP translation.
- **Verifiable Delivery**: PASS. User stories are independently testable: create order, read/list orders, cancel order, create payment, read/list payments, sync payment status. Verification covers tenant isolation, order invariants, price freezing, discount math, payment-status mapping, atomic persistence, gateway isolation, and absence of inventory/freight/Correios/split/refund/invoice/e-mail/prescription/webhook/frontend behavior.

## Project Structure

### Documentation (this feature)

```text
specs/012-backend-orders-payments/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── backend-orders-payments.openapi.yaml
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
    │       └── <timestamp>_orders_and_payments/
    │           └── migration.sql
    └── src/
        ├── config/
        │   └── env.ts                          # add ABACATEPAY_* (Zod)
        ├── shared/
        │   ├── application/
        │   │   ├── errors/                      # reuse NotFound/Conflict/Forbidden
        │   │   └── transaction/UnitOfWork.ts
        │   ├── domain/
        │   │   └── value-objects/
        │   │       ├── MoneyInCents.ts          # reused
        │   │       ├── Quantity.ts              # reused
        │   │       └── DiscountRate.ts          # new (optional)
        │   ├── infrastructure/database/prisma/
        │   └── presentation/http/fastify/
        │       └── app.ts                        # register orderRoutes
        └── modules/
            ├── products/
            │   └── application/repositories/ProductRepository.ts   # reused (price freeze, existence)
            ├── patients/
            │   └── application/repositories/PatientRepository.ts   # reused (patient + guardian linkage)
            └── orders/
                ├── application/
                │   ├── gateway/
                │   │   └── PaymentGatewayService.ts          # port
                │   ├── repositories/
                │   │   ├── OrderRepository.ts
                │   │   └── OrderPaymentRepository.ts
                │   └── use-cases/
                │       ├── CreateOrderUseCase.ts
                │       ├── ListOrdersUseCase.ts
                │       ├── GetOrderByIdUseCase.ts
                │       ├── CancelOrderUseCase.ts
                │       ├── CreateOrderPaymentUseCase.ts
                │       ├── ListOrderPaymentsUseCase.ts
                │       ├── GetOrderPaymentByIdUseCase.ts
                │       ├── SyncOrderPaymentStatusUseCase.ts
                │       └── *.test.ts
                ├── domain/
                │   ├── entities/
                │   │   ├── Order.ts
                │   │   ├── Order.test.ts
                │   │   ├── OrderItem.ts
                │   │   ├── OrderItem.test.ts
                │   │   ├── OrderPayment.ts
                │   │   └── OrderPayment.test.ts
                │   └── enums/
                │       ├── OrderStatus.ts
                │       ├── OrderDeliveryType.ts
                │       ├── PaymentMethod.ts
                │       └── PaymentStatus.ts
                ├── infrastructure/
                │   ├── create-order-use-cases.factory.ts
                │   ├── gateway/
                │   │   ├── AbacatePayPaymentGatewayService.ts
                │   │   └── AbacatePayPaymentGatewayService.test.ts
                │   └── prisma/
                │       ├── OrderMapper.ts
                │       ├── OrderItemMapper.ts
                │       ├── OrderPaymentMapper.ts
                │       ├── PrismaOrderRepository.ts
                │       └── PrismaOrderPaymentRepository.ts
                └── presentation/http/
                    ├── order-presenter.ts
                    ├── order-payment-presenter.ts
                    ├── order-routes.ts
                    ├── order-schemas.ts
                    └── order-schemas.test.ts
```

**Structure Decision**: Create a new `modules/orders` bounded module hosting orders, items and payments because they form one purchase lifecycle and every payment route is nested under an order. Reuse `shared/application/errors/*`, `PrismaTransactionManager`/`UnitOfWork`, `MoneyInCents`, `Quantity`, the global error handler, the existing `ProductRepository`/`PrismaProductRepository` (price freeze + existence), and the existing `PatientRepository` (patient existence + guardian linkage). Introduce an optional `DiscountRate` value object in `shared/domain/value-objects` for the `0.01..1` percentage. The AbacatePay adapter follows the `TurnstileCaptchaVerifier` outbound-HTTP precedent.

## Current Architecture Analysis

- **Domain modules**: Modules live under `packages/api/src/modules/<module>/domain` with `entities/` and `enums/`. Shared base classes `AggregateRoot`/`Entity` live in `shared/domain/entities`. `Order` and `OrderPayment` extend `AggregateRoot`; `OrderItem` extends `Entity`.
- **Value objects**: `MoneyInCents` (integer, nonnegative cents) and `Quantity` (integer, nonnegative) exist in `shared/domain/value-objects`. `OrderItem.unitPrice`/`OrderPayment.totalPaid` reuse `MoneyInCents`; `OrderItem.quantity` reuses `Quantity` with a positive guard. A new `DiscountRate` follows the same VO style.
- **Use cases**: Application use cases live in `application/use-cases`, receive repository interfaces and `UnitOfWork` via constructor deps, and run writes inside `PrismaTransactionManager.execute`. The order payment use cases additionally receive the `PaymentGatewayService` port.
- **Repositories**: Application repository interfaces live in `application/repositories` and define domain-returning methods (mutation) plus read models (responses), all organization-scoped. `ProductRepository.findByIdInOrganization` returns the domain `Product` (with `priceInCents`) for freezing; `PatientRepository.findDetailsByIdInOrganization` returns `guardianId` for linkage validation.
- **Prisma mappers/repositories**: Live under `infrastructure/prisma`, take `TransactionalPrisma`, and call `this.prisma.getClient()` so they work inside and outside transactions. `Product.priceInCents` is the cents-suffix convention to mirror.
- **Outbound HTTP precedent**: `TurnstileCaptchaVerifier` (a `CaptchaVerifier` port impl) uses an injectable `fetchFn`, base URL, timeout via `AbortController`, fails closed, and is wired by a factory reading validated `env`. `AbacatePayPaymentGatewayService` follows this exact shape.
- **Env**: `config/env.ts` validates `process.env` with Zod and a `requiredInProduction(name, fallback)` helper for production-required secrets with dev defaults. AbacatePay vars are added here.
- **Fastify routes**: Routes live in `presentation/http/*-routes.ts`, register on `FastifyInstance`, instantiate use cases via the module factory, parse params/body with Zod `safeParse`, return a local `400 ValidationError` on parse failure, and use presenters for response formatting. Routes are registered in `shared/presentation/http/fastify/app.ts`.
- **Error handling**: The global handler maps `DomainValidationError` -> 422, `DomainError` -> 400, `NotFoundError` -> 404, `ConflictError` -> 409, `ForbiddenError` -> 403, `AuthenticationError` -> 401, unknown 5xx -> `InternalServerError`. A gateway "method not supported"/"gateway failure" surfaces as a domain/application error mapped to a structured response.

## Target Architecture

1. **Enums**: Add `OrderStatus`, `OrderDeliveryType`, `PaymentMethod`, `PaymentStatus` with the exact spec values.
2. **DiscountRate value object** (optional): Add `shared/domain/value-objects/DiscountRate.ts` enforcing a decimal in `[0.01, 1]` via `DomainValidationError`, with `create(value)` and `value`, plus `DiscountRate.test.ts`.
3. **OrderItem entity**: `OrderItem extends Entity` with `create({ orderId, productId, unitPrice: MoneyInCents, quantity })`, validating non-blank ids and positive integer quantity.
4. **Order aggregate**: `Order extends AggregateRoot` with `create({ organizationId, patientId, guardianId?, deliveryType, items })` generating a readable `token`, requiring >= 1 item, building `OrderItem`s, computing `itemsAmount`, setting `status = REQUESTED`; `cancel()`; `ensureMutable()` guard; a `restore` factory for rehydration. Token generation uses `node:crypto`.
5. **OrderPayment aggregate**: `OrderPayment extends AggregateRoot` with `create({ orderId, totalPaid: MoneyInCents, discount?, paymentMethod })` starting `PENDING`; `attachGatewayReference(refs)`; `syncStatus(newStatus)`; a `restore` factory.
6. **PaymentGatewayService port**: Add `application/gateway/PaymentGatewayService.ts` with `createPayment` and `getPaymentStatus` and the input/output types from the data model. Only non-sensitive data crosses the port.
7. **Repository contracts**: Add `OrderRepository` and `OrderPaymentRepository` with read models (`OrderReadModel`, `OrderItemReadModel`, `OrderPaymentReadModel`), all organization/order-scoped, plus `existsByToken` and `existsPaidForOrder` helpers.
8. **Prisma mappers/repositories**: Add `OrderMapper`, `OrderItemMapper`, `OrderPaymentMapper`, `PrismaOrderRepository` (persists order + items atomically; provides scoped reads, token uniqueness), and `PrismaOrderPaymentRepository`.
9. **AbacatePay adapter**: Add `AbacatePayPaymentGatewayService` implementing the port over an injectable `fetchFn`, base URL and API key. PIX -> `POST /transparents/create`, status via `GET /transparents/check`; CARD -> `POST /checkouts/create`, status via `GET /checkouts/one`; `BOLETO` -> structured "method not supported" error. Maps gateway status -> `PaymentStatus`. Never returns secrets.
10. **Use cases** (writes run in `UnitOfWork`):
    - `CreateOrderUseCase`: validate patient exists in org; validate `guardianId` (if any) matches patient's `guardianId`; for each item load the product in-org, ensure active, freeze `unitPrice`; build `Order`; persist order + items atomically; (documented extension point: patient product-access rule).
    - `ListOrdersUseCase` / `GetOrderByIdUseCase`: return scoped read models (`NotFoundError` for get).
    - `CancelOrderUseCase`: load order in-org or `NotFoundError`; `cancel()` (rejects if already cancelled); save.
    - `CreateOrderPaymentUseCase`: load order in-org or `NotFoundError`; `ensureMutable()` (reject cancelled); reject if a `PAID`/`APPROVED` payment exists; compute gross from items and `totalPaid` with discount; build `OrderPayment` (`PENDING`); call `gateway.createPayment`; attach references; persist atomically; on gateway failure abort before persistence.
    - `ListOrderPaymentsUseCase` / `GetOrderPaymentByIdUseCase`: return scoped read models.
    - `SyncOrderPaymentStatusUseCase`: load payment in-order/in-org or `NotFoundError`; require `externalPaymentId`; call `gateway.getPaymentStatus`; map; `syncStatus`; save.
11. **Presentation**: Add Zod params/body schemas, JSON schemas, order/payment presenters, and the Fastify route file for the eight endpoints.
12. **Env**: Add `ABACATEPAY_API_KEY` (required in production, dev default) and `ABACATEPAY_BASE_URL` (default base URL) to `config/env.ts`.
13. **Factory + registration**: Add `create-order-use-cases.factory.ts` wiring `PrismaTransactionManager`, repositories, `PrismaProductRepository`, `PrismaPatientRepository`, the `AbacatePayPaymentGatewayService` (via a small factory reading env), and all eight use cases. Register `orderRoutes` in `app.ts`.
14. **Tests**: Domain invariants/state transitions, `DiscountRate`, use case scoping/atomic persistence/discount math/gateway interaction (fake port), schema validation, adapter mapping with injectable `fetchFn`, and a route placeholder.

## Files To Create

- `packages/api/src/shared/domain/value-objects/DiscountRate.ts`
- `packages/api/src/shared/domain/value-objects/DiscountRate.test.ts`
- `packages/api/src/modules/orders/domain/enums/OrderStatus.ts`
- `packages/api/src/modules/orders/domain/enums/OrderDeliveryType.ts`
- `packages/api/src/modules/orders/domain/enums/PaymentMethod.ts`
- `packages/api/src/modules/orders/domain/enums/PaymentStatus.ts`
- `packages/api/src/modules/orders/domain/entities/OrderItem.ts`
- `packages/api/src/modules/orders/domain/entities/OrderItem.test.ts`
- `packages/api/src/modules/orders/domain/entities/Order.ts`
- `packages/api/src/modules/orders/domain/entities/Order.test.ts`
- `packages/api/src/modules/orders/domain/entities/OrderPayment.ts`
- `packages/api/src/modules/orders/domain/entities/OrderPayment.test.ts`
- `packages/api/src/modules/orders/application/gateway/PaymentGatewayService.ts`
- `packages/api/src/modules/orders/application/repositories/OrderRepository.ts`
- `packages/api/src/modules/orders/application/repositories/OrderPaymentRepository.ts`
- `packages/api/src/modules/orders/application/use-cases/CreateOrderUseCase.ts` (+ `.test.ts`)
- `packages/api/src/modules/orders/application/use-cases/ListOrdersUseCase.ts` (+ `.test.ts`)
- `packages/api/src/modules/orders/application/use-cases/GetOrderByIdUseCase.ts` (+ `.test.ts`)
- `packages/api/src/modules/orders/application/use-cases/CancelOrderUseCase.ts` (+ `.test.ts`)
- `packages/api/src/modules/orders/application/use-cases/CreateOrderPaymentUseCase.ts` (+ `.test.ts`)
- `packages/api/src/modules/orders/application/use-cases/ListOrderPaymentsUseCase.ts` (+ `.test.ts`)
- `packages/api/src/modules/orders/application/use-cases/GetOrderPaymentByIdUseCase.ts` (+ `.test.ts`)
- `packages/api/src/modules/orders/application/use-cases/SyncOrderPaymentStatusUseCase.ts` (+ `.test.ts`)
- `packages/api/src/modules/orders/application/use-cases/order-use-case-test-utils.ts`
- `packages/api/src/modules/orders/infrastructure/create-order-use-cases.factory.ts`
- `packages/api/src/modules/orders/infrastructure/gateway/AbacatePayPaymentGatewayService.ts` (+ `.test.ts`)
- `packages/api/src/modules/orders/infrastructure/prisma/OrderMapper.ts`
- `packages/api/src/modules/orders/infrastructure/prisma/OrderItemMapper.ts`
- `packages/api/src/modules/orders/infrastructure/prisma/OrderPaymentMapper.ts`
- `packages/api/src/modules/orders/infrastructure/prisma/PrismaOrderRepository.ts`
- `packages/api/src/modules/orders/infrastructure/prisma/PrismaOrderPaymentRepository.ts`
- `packages/api/src/modules/orders/presentation/http/order-presenter.ts`
- `packages/api/src/modules/orders/presentation/http/order-payment-presenter.ts`
- `packages/api/src/modules/orders/presentation/http/order-schemas.ts`
- `packages/api/src/modules/orders/presentation/http/order-schemas.test.ts`
- `packages/api/src/modules/orders/presentation/http/order-routes.ts`
- `packages/api/prisma/migrations/<timestamp>_orders_and_payments/migration.sql`
- Optional route-level test placeholder: `packages/api/src/modules/orders/presentation/http/order-routes.test.ts`

## Files To Modify

- `packages/api/prisma/schema.prisma`: add `OrderStatus`, `OrderDeliveryType`, `PaymentMethod`, `PaymentStatus` enums; `Order`, `OrderItem`, `OrderPayment` models; back-relations on `Organization` (`orders`), `Patient` (`orders`), `Guardian` (`orders`), and `Product` (`orderItems`); indexes; and the `@@unique([organizationId, token])` constraint.
- `packages/api/src/config/env.ts`: add Zod-validated `ABACATEPAY_API_KEY` and `ABACATEPAY_BASE_URL`.
- `packages/api/src/shared/presentation/http/fastify/app.ts`: import and register `orderRoutes`.
- `specs/012-backend-orders-payments/*`: spec, plan, research, data model, contract, quickstart, checklists, tasks.
- `AGENTS.md`: managed Spec Kit plan reference (if present).

## Risks

- **Gateway failure leaves orphan payment**: Mitigation — call `gateway.createPayment` first; only persist the local payment (with references) after success, inside the same `UnitOfWork`. Tests assert no local payment exists when the gateway throws.
- **Secret leakage**: Mitigation — `PaymentGatewayService` outputs carry no secrets; the adapter never logs the API key; presenters expose only the whitelisted reference fields. A test asserts responses contain no `apiKey`/`secret`/`authorization`.
- **Token collision**: Mitigation — `@@unique([organizationId, token])` plus regenerate-and-retry in `CreateOrderUseCase`; a persistent failure returns a structured error.
- **Discount/rounding drift**: Mitigation — `discount` is `Decimal(3,2)`; `totalPaid` is computed as `round(gross * (1 - discount))` and stored as integer cents via `MoneyInCents`. Tests cover boundary discounts `0.01` and `1`.
- **BOLETO undocumented**: Mitigation — the enum keeps `BOLETO`, but the adapter returns a structured "method not supported by gateway" error; documented in spec/research as a future integration once AbacatePay boleto is available.
- **Patient product-access rule absent**: Mitigation — the access check is a documented conditional extension point and does not block; `CreateOrderUseCase` has a clearly marked hook to enable it later.
- **Tenant leakage**: Mitigation — every repository read includes `organizationId` (and `orderId` for payments); tests create data across organizations.
- **Inventory entanglement**: Mitigation — orders never touch `InventoryItem`/`Product` writes; reservation/decrement is explicitly out of scope. Review confirms no inventory writes.
- **Order status workflow creep**: Mitigation — only `cancel()` is implemented; other transitions are out of scope. `sync-status` does not change `Order`.
- **Generated Prisma client missing new models/enums**: Mitigation — run `pnpm prisma:generate` after schema/migration before typecheck/tests.

## Implementation Order

1. Add `OrderStatus`, `OrderDeliveryType`, `PaymentMethod`, `PaymentStatus` enums.
2. Add `DiscountRate` value object with tests.
3. Add `OrderItem` entity with tests.
4. Add `Order` aggregate (token, items, `itemsAmount`, `cancel`, `ensureMutable`, `restore`) with tests.
5. Add `OrderPayment` aggregate (`PENDING`, `attachGatewayReference`, `syncStatus`, `restore`) with tests.
6. Add Prisma enums/models/relations/unique/indexes and the migration.
7. Add `PaymentGatewayService` port and its input/output types.
8. Add `OrderRepository` and `OrderPaymentRepository` interfaces + read models.
9. Add `OrderMapper`, `OrderItemMapper`, `OrderPaymentMapper`.
10. Add `PrismaOrderRepository` and `PrismaOrderPaymentRepository`.
11. Add `AbacatePayPaymentGatewayService` with injectable `fetchFn` and tests; add `ABACATEPAY_*` env.
12. Add order use cases (create/list/get/cancel) and tests.
13. Add payment use cases (create/list/get/sync) and tests.
14. Add Zod schemas and schema tests.
15. Add presenters and Fastify route handlers for all eight endpoints.
16. Add the order use-case factory (incl. gateway factory) and register `orderRoutes` in `app.ts`.
17. Add route-level test placeholder if practical.
18. Run Prisma generation and validation gates.

## Rollback

1. Revert route registration from `packages/api/src/shared/presentation/http/fastify/app.ts`.
2. Remove `packages/api/src/modules/orders`.
3. Revert `ABACATEPAY_*` additions in `packages/api/src/config/env.ts`.
4. Remove `packages/api/src/shared/domain/value-objects/DiscountRate.ts` and its test if unused elsewhere.
5. Revert `Order`, `OrderItem`, `OrderPayment`, the four enums, the `Organization`/`Patient`/`Guardian`/`Product` back-relations, and the orders migration from Prisma files.
6. Run `pnpm prisma:generate` to restore the generated client shape.
7. Re-run `pnpm typecheck:api` and `pnpm test:api` to confirm the previous API surface is restored.

If the orders migration was already applied to a shared database, create a reversing forward migration that drops `order_payments`, `order_items`, `orders` and the four enum types only if no dependent feature has started using them (never edit an applied migration).

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
pnpm --filter @flora/api test Order
pnpm --filter @flora/api test OrderPayment
pnpm --filter @flora/api test DiscountRate
pnpm --filter @flora/api test AbacatePay
pnpm --filter @flora/api test order-schemas
```

## Phase 0 Research Summary

See [research.md](./research.md). All planning unknowns are resolved, including the AbacatePay method/status mapping and the no-webhook decision.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- API contract: [contracts/backend-orders-payments.openapi.yaml](./contracts/backend-orders-payments.openapi.yaml)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Monorepo Boundaries**: PASS. Design artifacts target only `packages/api` and feature docs.
- **Shared Contracts**: PASS. Backend API contracts are documented; no shared package types are required until a web/shared consumer exists.
- **Tenant Isolation**: PASS. Data model, contracts, repository plan, and quickstart scenarios all require `organizationId`/`orderId` scoping.
- **Clean Layering**: PASS. Planned files keep domain free of Prisma/Fastify/Zod/AbacatePay/HTTP; application depends on repository interfaces and the gateway port; infrastructure holds Prisma and the AbacatePay adapter; presentation holds Fastify/Zod.
- **Verifiable Delivery**: PASS. Quickstart and tests cover order create/read/list/cancel, payment create/read/list/sync, invariants, discount math, gateway isolation, atomic persistence, tenant isolation, and absence of inventory/freight/Correios/split/refund/invoice/e-mail/prescription/webhook/frontend behavior.

## Complexity Tracking

No constitution violations. The only cross-module dependencies are read-only reuse of `ProductRepository` (price freeze + existence) and `PatientRepository` (patient existence + guardian linkage), consistent with how `inventory` reuses `ProductRepository`.

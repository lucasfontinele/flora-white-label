# Tasks: Pedidos e Pagamentos no Backend (Orders & Payments)

**Input**: Design documents from `/specs/012-backend-orders-payments/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/backend-orders-payments.openapi.yaml](./contracts/backend-orders-payments.openapi.yaml), [quickstart.md](./quickstart.md)

**Tests**: Required. This feature changes API contracts, tenant isolation, validation, persistence, domain invariants, money/discount math, and an external gateway integration.

## Format: `[ID] [Layer] Description`

- **[Layer]**: Domain, Application, Infrastructure, Presentation, Test, or Validation.
- Each task uses exact repository paths and includes `Objective`, `Depends`, and `Acceptance`.
- No task implements frontend, visual cart, frontend checkout, cookies/IronSession, new auth, new RBAC, Correios, real freight, inventory reservation/decrement, payment split, real refund, invoice, e-mail, prescription-as-entity, or webhooks, and no task mutates `Product` or inventory.

---

## Domain

- [x] T001 [Domain] Create `OrderStatus` enum in `packages/api/src/modules/orders/domain/enums/OrderStatus.ts`. Objective: define `REQUESTED`, `UNDER_REVIEW`, `IN_SEPARATION`, `APPROVED`, `READY_FOR_PICKUP`, `SHIPPED`, `DELIVERED`, `CANCELLED`; Depends: none; Acceptance: values match the spec exactly.
- [x] T002 [Domain] Create `OrderDeliveryType` enum in `packages/api/src/modules/orders/domain/enums/OrderDeliveryType.ts`. Objective: define `CORREIOS`, `PICKUP`; Depends: none; Acceptance: values match the spec exactly.
- [x] T003 [Domain] Create `PaymentMethod` enum in `packages/api/src/modules/orders/domain/enums/PaymentMethod.ts`. Objective: define `CREDIT_CARD`, `BOLETO`, `PIX`; Depends: none; Acceptance: values match the spec exactly.
- [x] T004 [Domain] Create `PaymentStatus` enum in `packages/api/src/modules/orders/domain/enums/PaymentStatus.ts`. Objective: define `PENDING`, `EXPIRED`, `CANCELLED`, `PAID`, `UNDER_DISPUTE`, `REFUNDED`, `REDEEMED`, `APPROVED`, `FAILED`; Depends: none; Acceptance: values match the spec exactly.
- [x] T005 [Domain] Create `DiscountRate` value object in `packages/api/src/shared/domain/value-objects/DiscountRate.ts`. Objective: enforce a decimal in `[0.01, 1]` via `DomainValidationError`, mirroring `MoneyInCents`; Depends: none; Acceptance: exposes `create(value)` and `value`, rejects values < 0.01, > 1, NaN and non-numeric, and has no infrastructure import.
- [x] T006 [Domain] Create `OrderItem` Entity in `packages/api/src/modules/orders/domain/entities/OrderItem.ts`. Objective: model `orderId`, `productId`, `unitPrice` (`MoneyInCents`), `quantity` (`Quantity`, positive); validate non-blank ids and integer quantity > 0; expose `unitPriceInCents`; Depends: T003-none (uses `MoneyInCents`, `Quantity`); Acceptance: extends `Entity`, rejects quantity <= 0, frozen `unitPrice`, no infrastructure import.
- [x] T007 [Domain] Create `Order` Aggregate Root in `packages/api/src/modules/orders/domain/entities/Order.ts`. Objective: model `organizationId`, `token`, `patientId`, `guardianId?`, `status`, `deliveryType`, `itemsAmount`, and `OrderItem[]`; `create(...)` generates a readable `token` (via `node:crypto`), requires >= 1 item, computes `itemsAmount` = sum of quantities, sets `status = REQUESTED`; implement `cancel()` and `ensureMutable()`; expose `restore(...)` for rehydration; Depends: T001, T002, T006; Acceptance: extends `AggregateRoot`, rejects zero-item orders, blocks changes when `CANCELLED`, never references inventory/Product writes.
- [x] T008 [Domain] Create `OrderPayment` Aggregate Root in `packages/api/src/modules/orders/domain/entities/OrderPayment.ts`. Objective: model `orderId`, `totalPaid` (`MoneyInCents`), `discount` (`DiscountRate?`), `paymentMethod`, `status`, and gateway reference fields (`externalPaymentId`, `checkoutUrl`, `pixQrCode`, `pixQrCodeBase64`, `expiresAt`); `create(...)` starts `PENDING`; implement `attachGatewayReference(refs)` and `syncStatus(newStatus)`; expose `restore(...)`; Depends: T003, T004, T005; Acceptance: extends `AggregateRoot`, starts `PENDING`, stores no secret, exposes `totalPaidInCents`.

## Infrastructure - Persistence (Prisma)

- [x] T009 [Infrastructure] Update Prisma schema in `packages/api/prisma/schema.prisma`. Objective: add `OrderStatus`, `OrderDeliveryType`, `PaymentMethod`, `PaymentStatus` enums; `Order` model (`orders`, `token`, `itemsAmount` Int, `status`, `deliveryType`, `patientId`, `guardianId?`, relations to `Organization`/`Patient`/`Guardian`, `items`, `payments`, `@@unique([organizationId, token])`, `@@index([organizationId])`, `@@index([organizationId, patientId])`); `OrderItem` model (`order_items`, `orderId`, `productId`, `unitPriceInCents` Int, `quantity` Int, relations to `Order`/`Product`, `@@index([orderId])`); `OrderPayment` model (`order_payments`, `orderId`, denormalized `organizationId`, `totalPaidInCents` Int, `discount` `Decimal(3,2)?`, `paymentMethod`, `status`, gateway reference columns, `expiresAt` DateTime?, relation to `Order`, `@@index([orderId])`, `@@index([organizationId])`); add back-relations `Organization.orders`, `Patient.orders`, `Guardian.orders`, `Product.orderItems`; Depends: T001-T004; Acceptance: schema contains no inventory/freight/Correios/invoice/refund/split/webhook fields and represents all data-model fields.
- [x] T010 [Infrastructure] Create migration in `packages/api/prisma/migrations/<timestamp>_orders_and_payments/migration.sql`. Objective: create the four enum types, three tables, indexes, unique constraint, and foreign keys for PostgreSQL; Depends: T009; Acceptance: forward-only migration creating only orders/items/payments persistence and no out-of-scope tables; never edits an applied migration.

## Application - Gateway Port and Repository Interfaces

- [x] T011 [Application] Create `PaymentGatewayService` port in `packages/api/src/modules/orders/application/gateway/PaymentGatewayService.ts`. Objective: define `createPayment(input)` and `getPaymentStatus(externalPaymentId)` plus `CreatePaymentGatewayInput`, `CreatePaymentGatewayOutput`, `PaymentGatewayStatusOutput` per the data model; Depends: T003, T004; Acceptance: only non-sensitive data crosses the port; no AbacatePay/HTTP/Prisma import.
- [x] T012 [Application] Create `OrderRepository` interface in `packages/api/src/modules/orders/application/repositories/OrderRepository.ts`. Objective: define `OrderReadModel` and `OrderItemReadModel` and scoped methods `findByIdInOrganization`, `findDetailsByIdInOrganization`, `findAllByOrganization`, `existsByToken`, `create`, `save`; Depends: T007; Acceptance: no unscoped reads for API use cases.
- [x] T013 [Application] Create `OrderPaymentRepository` interface in `packages/api/src/modules/orders/application/repositories/OrderPaymentRepository.ts`. Objective: define `OrderPaymentReadModel` and methods `findByIdInOrderInOrganization`, `findDetailsByIdInOrderInOrganization`, `findAllByOrderInOrganization`, `existsPaidForOrder`, `create`, `save`; Depends: T008; Acceptance: read model excludes any gateway secret; all reads order/organization-scoped.

## Infrastructure - Mappers, Prisma Repositories, Gateway Adapter

- [x] T014 [Infrastructure] Create `OrderMapper` and `OrderItemMapper` in `packages/api/src/modules/orders/infrastructure/prisma/OrderMapper.ts` and `.../OrderItemMapper.ts`. Objective: map Prisma rows to domain (`restore`) and to read models, and domain to create/update inputs (incl. nested items); Depends: T006, T007, T009, T012; Acceptance: preserves token, ids, quantities, `unitPriceInCents`, `itemsAmount`, timestamps.
- [x] T015 [Infrastructure] Create `OrderPaymentMapper` in `packages/api/src/modules/orders/infrastructure/prisma/OrderPaymentMapper.ts`. Objective: map domain payment to create/update inputs and Prisma rows to read model; map `discount` Decimal<->number and `totalPaidInCents`; Depends: T008, T009, T013; Acceptance: preserves method, status, gateway references, `expiresAt`; never maps a secret column (none exists).
- [x] T016 [Infrastructure] Create `PrismaOrderRepository` in `packages/api/src/modules/orders/infrastructure/prisma/PrismaOrderRepository.ts`. Objective: implement `OrderRepository` over `TransactionalPrisma`; `create` persists order + items atomically; reads scoped by `{ organizationId, orderId }`; `existsByToken` scoped by organization; Depends: T012, T014; Acceptance: organization-scoped reads; create uses nested item writes in one transaction.
- [x] T017 [Infrastructure] Create `PrismaOrderPaymentRepository` in `packages/api/src/modules/orders/infrastructure/prisma/PrismaOrderPaymentRepository.ts`. Objective: implement `OrderPaymentRepository` over `TransactionalPrisma`; reads scoped by `{ organizationId, orderId, paymentId }`; `existsPaidForOrder` checks `PAID`/`APPROVED`; Depends: T013, T015; Acceptance: scoped reads/writes via the mapper; list ordered by `createdAt` desc.
- [x] T018 [Infrastructure] Create `AbacatePayPaymentGatewayService` in `packages/api/src/modules/orders/infrastructure/gateway/AbacatePayPaymentGatewayService.ts`. Objective: implement `PaymentGatewayService` over an injectable `fetchFn`, base URL and API key (Bearer); PIX -> `POST /transparents/create`, status via `GET /transparents/check`; CARD -> `POST /checkouts/create`, status via `GET /checkouts/one`; `BOLETO` -> structured "method not supported by gateway" error; parse the `{ data, success, error }` envelope; map gateway status -> `PaymentStatus`; Depends: T011; Acceptance: mirrors `TurnstileCaptchaVerifier` shape (timeout via `AbortController`), never logs/returns the API key, returns only non-sensitive references.
- [x] T019 [Infrastructure] Add Zod-validated AbacatePay env to `packages/api/src/config/env.ts`. Objective: add `ABACATEPAY_API_KEY` (required in production via `requiredInProduction`, dev default) and `ABACATEPAY_BASE_URL` (default `https://api.abacatepay.com/v2`); Depends: none; Acceptance: invalid/missing production secret fails fast at startup; no secret echoed.

## Application - Use Cases

- [x] T020 [Application] Create `CreateOrderUseCase` in `packages/api/src/modules/orders/application/use-cases/CreateOrderUseCase.ts`. Objective: validate patient via `PatientRepository.findDetailsByIdInOrganization` (`NotFoundError`); validate `guardianId` (if provided) equals patient's `guardianId` (`DomainValidationError`/`ForbiddenError`); for each item load `ProductRepository.findByIdInOrganization`, ensure exists+active (`NotFoundError`/`DomainValidationError`), freeze `unitPrice` from product `priceInCents`; build `Order` (generates token, computes `itemsAmount`); persist order + items atomically in `UnitOfWork`; include a clearly-marked optional patient product-access hook (no-op until the rule exists); Depends: T012, T016; Acceptance: returns `OrderReadModel`; depends only on interfaces; never mutates `Product`/inventory; token uniqueness handled via `existsByToken`/retry.
- [x] T021 [Application] Create `ListOrdersUseCase` in `packages/api/src/modules/orders/application/use-cases/ListOrdersUseCase.ts`. Objective: return `{ data }` of organization-scoped order summaries; Depends: T012; Acceptance: no Prisma/Fastify/Zod dependency.
- [x] T022 [Application] Create `GetOrderByIdUseCase` in `packages/api/src/modules/orders/application/use-cases/GetOrderByIdUseCase.ts`. Objective: return the scoped order detail (with items) or `NotFoundError`; Depends: T012; Acceptance: tenant-scoped.
- [x] T023 [Application] Create `CancelOrderUseCase` in `packages/api/src/modules/orders/application/use-cases/CancelOrderUseCase.ts`. Objective: load order in-org or `NotFoundError`, call `cancel()` (reject if already cancelled), save in `UnitOfWork`; Depends: T012, T016; Acceptance: returns updated read model; cancelled order rejects re-cancel.
- [x] T024 [Application] Create `CreateOrderPaymentUseCase` in `packages/api/src/modules/orders/application/use-cases/CreateOrderPaymentUseCase.ts`. Objective: load order in-org or `NotFoundError`; `ensureMutable()` (reject cancelled); reject if `existsPaidForOrder` (`ConflictError`); compute gross from items and `totalPaid = round(gross * (1 - discount))`; build `OrderPayment` (`PENDING`); call `PaymentGatewayService.createPayment`; `attachGatewayReference`; persist atomically; on gateway failure abort before persistence; Depends: T011, T012, T013, T016, T017; Acceptance: returns `OrderPaymentReadModel` with references and no secret; no orphan payment on gateway error; `BOLETO` surfaces the gateway "not supported" error.
- [x] T025 [Application] Create `ListOrderPaymentsUseCase` in `packages/api/src/modules/orders/application/use-cases/ListOrderPaymentsUseCase.ts`. Objective: verify the scoped order exists (`NotFoundError`), then return `{ data }` from `findAllByOrderInOrganization`; Depends: T012, T013; Acceptance: order/organization-scoped; no secrets.
- [x] T026 [Application] Create `GetOrderPaymentByIdUseCase` in `packages/api/src/modules/orders/application/use-cases/GetOrderPaymentByIdUseCase.ts`. Objective: return the scoped payment read model or `NotFoundError`; Depends: T013; Acceptance: tenant/order-scoped; no secrets.
- [x] T027 [Application] Create `SyncOrderPaymentStatusUseCase` in `packages/api/src/modules/orders/application/use-cases/SyncOrderPaymentStatusUseCase.ts`. Objective: load payment in-order/in-org or `NotFoundError`; require `externalPaymentId` (`DomainValidationError` when absent); call `PaymentGatewayService.getPaymentStatus`; `syncStatus(mapped)`; save in `UnitOfWork`; do not change `Order` status; Depends: T013, T017, T011; Acceptance: returns updated read model; rejects missing `externalPaymentId`.

## Presentation

- [x] T028 [Presentation] Create order/payment Zod schemas in `packages/api/src/modules/orders/presentation/http/order-schemas.ts`. Objective: define organization/order/payment params schemas + JSON schemas, `createOrderBodySchema` (patientId, guardianId?, deliveryType enum, items[] with productId + quantity>=1), `createPaymentBodySchema` (paymentMethod enum, discount optional in `[0.01,1]`), order/order-detail/payment/list response JSON schemas, and error response schema; Depends: T001-T004; Acceptance: Zod strict; JSON schemas match the OpenAPI contract.
- [x] T029 [Presentation] Create presenters in `packages/api/src/modules/orders/presentation/http/order-presenter.ts` and `.../order-payment-presenter.ts`. Objective: format order/item/payment read models to HTTP (ISO dates, `items`, `discount` as number, gateway references only); Depends: T012, T013; Acceptance: payment presenter never includes secrets; null-able reference fields preserved.
- [x] T030 [Presentation] Create Fastify handlers/routes in `packages/api/src/modules/orders/presentation/http/order-routes.ts`. Objective: implement the eight endpoints (`POST/GET .../orders`, `GET .../orders/:orderId`, `PATCH .../orders/:orderId/cancel`, `POST/GET .../orders/:orderId/payments`, `GET .../orders/:orderId/payments/:paymentId`, `PATCH .../orders/:orderId/payments/:paymentId/sync-status`) parsing with Zod `safeParse`, returning a local `400 ValidationError` on parse failure, presenters for responses; Depends: T020-T029; Acceptance: correct status codes (201 on create, 200 otherwise); swagger tags set.
- [x] T031 [Presentation] Create the order use-case factory and gateway wiring in `packages/api/src/modules/orders/infrastructure/create-order-use-cases.factory.ts`, then register routes in `packages/api/src/shared/presentation/http/fastify/app.ts`. Objective: wire `PrismaTransactionManager`, both Prisma order repositories, `PrismaProductRepository`, `PrismaPatientRepository`, the `AbacatePayPaymentGatewayService` (built from validated env), and all eight use cases; register `orderRoutes`; Depends: T016, T017, T018, T019, T020-T030; Acceptance: factory keeps Prisma/AbacatePay in infrastructure; app exposes all eight endpoints without touching `packages/web`.

## Tests

- [x] T032 [Test] Create `DiscountRate` unit tests in `packages/api/src/shared/domain/value-objects/DiscountRate.test.ts`. Objective: cover `0.01`, `1`, mid-range values, and rejection of `0`, `< 0.01`, `> 1`, negative, NaN; Depends: T005; Acceptance: tests pass against the value object rules.
- [x] T033 [Test] Create domain unit tests in `packages/api/src/modules/orders/domain/entities/Order.test.ts`, `.../OrderItem.test.ts`, and `.../OrderPayment.test.ts`. Objective: test token generation, `itemsAmount` = sum of quantities, at-least-one-item rejection, start `REQUESTED`, `cancel()` then blocked mutation, item positive-quantity and frozen price, payment starts `PENDING`, `attachGatewayReference`, `syncStatus`; Depends: T006, T007, T008; Acceptance: invariants enforced; cancelled order rejects changes.
- [x] T034 [Test] Create use-case unit tests and shared fakes in `packages/api/src/modules/orders/application/use-cases/order-use-case-test-utils.ts` and one `*.test.ts` per use case. Objective: in-memory order/payment repositories, product and patient repository fakes, a fake `PaymentGatewayService`, and an immediate unit of work; verify create/list/get/cancel order and create/list/get/sync payment behavior, tenant scoping, not-found, cancelled-order/paid-order guards, discount math (`0.01` and `1` boundaries), price freezing, gateway-failure -> no orphan payment, and `BOLETO` not-supported; Depends: T020-T027; Acceptance: no Prisma usage; no secret in any asserted response.
- [x] T035 [Test] Create schema tests in `packages/api/src/modules/orders/presentation/http/order-schemas.test.ts`. Objective: validate create-order and create-payment bodies and params, including item quantity >= 1, discount range `[0.01,1]`, and rejection of unknown fields; Depends: T028; Acceptance: tests cover valid and invalid payloads.
- [x] T036 [Test] Create `AbacatePayPaymentGatewayService` tests in `packages/api/src/modules/orders/infrastructure/gateway/AbacatePayPaymentGatewayService.test.ts`. Objective: with an injectable `fetchFn`, assert PIX calls `/transparents/create` and maps `brCode`/`brCodeBase64`/id, CARD calls `/checkouts/create` and maps `url`/id, status mapping for `/transparents/check` and `/checkouts/one`, the `{ data, success, error }` envelope handling, `BOLETO` rejection, and that the API key is sent as Bearer but never returned; Depends: T018; Acceptance: mirrors `TurnstileCaptchaVerifier.test.ts` conventions; no real network call.
- [x] T037 [Test] Create HTTP route test placeholder in `packages/api/src/modules/orders/presentation/http/order-routes.test.ts` mirroring `product-routes.test.ts`. Objective: document that HTTP success-path coverage is deferred until a shared Fastify-inject database pattern exists, keeping coverage in domain/use-case/schema/adapter tests; Depends: T031; Acceptance: `describe.skip` placeholder consistent with the product convention.

## Validation

- [x] T038 [Validation] Run `pnpm prisma:generate`. Objective: regenerate the Prisma client after schema/migration changes; Depends: T009, T010; Acceptance: command exits 0.
- [x] T039 [Validation] Run `pnpm typecheck:api`. Objective: validate TypeScript types and layer imports; Depends: T038; Acceptance: command exits 0.
- [x] T040 [Validation] Run `pnpm --filter @flora/api lint`. Objective: validate lint rules; Depends: T039; Acceptance: command exits 0.
- [x] T041 [Validation] Run `pnpm test:api`. Objective: validate `DiscountRate`, domain, use-case, schema, adapter, and placeholder tests; Depends: T040; Acceptance: command exits 0.
- [x] T042 [Validation] Run `pnpm build:api`. Objective: validate the production build; Depends: T041; Acceptance: command exits 0.

---

## Requested Order Mapping

1. `OrderStatus` enum -> T001.
2. `OrderDeliveryType` enum -> T002.
3. `PaymentMethod` enum -> T003.
4. `PaymentStatus` enum -> T004.
5. `DiscountRate` value object -> T005.
6. `OrderItem` Entity -> T006.
7. `Order` Aggregate Root -> T007.
8. `OrderPayment` Aggregate Root -> T008.
9. Prisma schema -> T009.
10. Migration -> T010.
11. `PaymentGatewayService` port -> T011.
12. `OrderRepository` -> T012.
13. `OrderPaymentRepository` -> T013.
14. `OrderMapper`/`OrderItemMapper` -> T014.
15. `OrderPaymentMapper` -> T015.
16. `PrismaOrderRepository` -> T016.
17. `PrismaOrderPaymentRepository` -> T017.
18. `AbacatePayPaymentGatewayService` -> T018.
19. AbacatePay env -> T019.
20. `CreateOrderUseCase` -> T020.
21. `ListOrdersUseCase` -> T021.
22. `GetOrderByIdUseCase` -> T022.
23. `CancelOrderUseCase` -> T023.
24. `CreateOrderPaymentUseCase` -> T024.
25. `ListOrderPaymentsUseCase` -> T025.
26. `GetOrderPaymentByIdUseCase` -> T026.
27. `SyncOrderPaymentStatusUseCase` -> T027.
28. Zod schemas -> T028.
29. Presenters -> T029.
30. Fastify routes -> T030.
31. Factory + route registration -> T031.
32. `DiscountRate` tests -> T032.
33. Domain tests -> T033.
34. Use-case tests -> T034.
35. Schema tests -> T035.
36. AbacatePay adapter tests -> T036.
37. HTTP test placeholder -> T037.
38. Prisma generate -> T038.
39. Typecheck -> T039.
40. Lint -> T040.
41. Tests -> T041.
42. Build -> T042.

## Guardrails

- Backend only; do not alter `packages/web`.
- No frontend, visual cart, frontend checkout, cookies, IronSession, new auth, new RBAC, Correios, real freight, inventory reservation/decrement, payment split, real refund, invoice, e-mail, prescription-as-entity, or webhook code.
- Orders must never write to `Product` or inventory; only read product existence/price and patient/guardian linkage.
- Freeze item `unitPrice` at order creation; never recalculate from the catalog afterward.
- Generate a readable, organization-unique `token`; handle collisions without leaking internal errors.
- A `CANCELLED` order rejects status/item changes and new payments.
- Payments start `PENDING`; `totalPaid` is integer cents; `discount`, when present, is `[0.01, 1]`.
- Never persist or return gateway secrets (token/secret/credentials).
- Keep AbacatePay isolated in `AbacatePayPaymentGatewayService`; use cases depend only on `PaymentGatewayService`.
- Persist order+items and payment+references atomically in one `UnitOfWork`; on gateway failure, leave no orphan payment.
- Keep Domain free of Prisma/Fastify/Zod/AbacatePay/HTTP; keep Application free of direct Prisma/AbacatePay.
- Validate AbacatePay env with Zod; fail fast in production when the secret is missing.
- Run the migration against a database only if necessary; the migration file is created regardless; never edit an applied migration.

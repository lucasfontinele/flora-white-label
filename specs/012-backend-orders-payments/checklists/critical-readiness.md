# Critical Readiness Checklist: Pedidos e Pagamentos no Backend (Orders & Payments)

**Purpose**: Gate pre-implementation readiness across scope, DDD boundaries, gateway integration, persistence planning, tasks, tests, and rollback
**Created**: 2026-06-24
**Feature**: [spec.md](../spec.md)
**Plan**: [plan.md](../plan.md)
**Tasks**: [tasks.md](../tasks.md)
**Classification**: Pode implementar agora

## Scope Boundaries

- [x] CHK001 Is the feature specified as backend-only, with the affected package limited to API/documentation and frontend explicitly excluded? [Completeness, Spec §Input, Spec §FR-067, Plan §Summary]
- [x] CHK002 Are visual cart, frontend checkout, cookies, IronSession, new auth, and new RBAC explicitly excluded? [Completeness, Spec §FR-067, Plan §Constraints, Tasks §Guardrails]
- [x] CHK003 Are Correios, real freight, inventory reservation/decrement, split, real refund, invoice, e-mail, prescription-as-entity, and webhooks explicitly out of scope? [Completeness, Spec §FR-056, Spec §FR-067, Plan §Constraints, Tasks §Guardrails]
- [x] CHK004 Is it explicit that orders never mutate `Product` or inventory (only read price/existence)? [Consistency, Spec §FR-023, Spec §Edge Cases, Plan §Risks, Research §Freeze unitPrice]
- [x] CHK005 Is the implementation task list free from frontend work and explicit about not altering `packages/web`? [Consistency, Plan §Constraints, Tasks §T031, Tasks §Guardrails]

## Domain Model Requirements

- [x] CHK006 Is `Order` specified as an Aggregate Root with `id`, `organizationId`, `token`, `patientId`, `guardianId?`, `status`, `itemsAmount`, `deliveryType`, timestamps? [Completeness, Spec §FR-005-FR-006, Data Model §Order]
- [x] CHK007 Is `OrderItem` specified as an Entity inside the `Order` aggregate with `id`, `orderId`, `productId`, `unitPrice` (cents), `quantity` (positive)? [Completeness, Spec §FR-019-FR-022, Data Model §OrderItem]
- [x] CHK008 Is `OrderPayment` specified in the domain (simple Aggregate Root) with `id`, `orderId`, `totalPaid`, `discount`, `paymentMethod`, `status`, timestamps, plus gateway references? [Completeness, Spec §FR-031-FR-032, Spec §FR-040, Data Model §OrderPayment]
- [x] CHK009 Are the order invariants specified (>= 1 item, `itemsAmount` = sum of quantities, readable unique token, start `REQUESTED`, cancelled cannot change)? [Clarity, Spec §FR-010-FR-017, Data Model §Order]
- [x] CHK010 Is price freezing specified (item `unitPrice` frozen from product price at creation, never recalculated)? [Clarity, Spec §FR-023, Research §Freeze unitPrice]
- [x] CHK011 Are the four enums fully enumerated (`OrderStatus`, `OrderDeliveryType`, `PaymentMethod`, `PaymentStatus`)? [Completeness, Spec §FR-014-FR-015, Spec §FR-037, Spec §FR-039, Data Model §Enums]
- [x] CHK012 Are money/quantity value objects reused (`MoneyInCents`, `Quantity`) and `discount` modeled as `[0.01, 1]` with `totalPaid = round(gross * (1 - discount))`? [Clarity, Spec §FR-033-FR-035, Spec §FR-066, Research §discount]
- [x] CHK013 Is "payment starts PENDING and never stores/returns gateway secrets" specified? [Clarity, Spec §FR-038, Spec §FR-041, Data Model §OrderPayment]
- [x] CHK014 Is atomic persistence specified for order+items and payment+references in one Unit of Work, with no orphan payment on gateway failure? [Completeness, Spec §FR-065, Plan §Risks, Research §Atomic persistence]

## Gateway Integration

- [x] CHK015 Is the `PaymentGatewayService` port specified in application with `createPayment`/`getPaymentStatus` and only non-sensitive data crossing it? [Consistency, Spec §FR-046, Data Model §Application Port]
- [x] CHK016 Is `AbacatePayPaymentGatewayService` specified in infrastructure, isolating AbacatePay from domain/application? [Consistency, Spec §FR-047-FR-048, Plan §Target Architecture, Tasks §T018]
- [x] CHK017 Does the integration follow `ABACATE_INTEGRATION.md` (base URL, Bearer, cents, `{ data, success, error }`, PIX `/transparents/*`, CARD `/checkouts/*`)? [Consistency, Spec §FR-050-FR-052, Research §Method mapping]
- [x] CHK018 Is `BOLETO` handled as gateway-unsupported (enum kept, structured error) and is the webhook exclusion justified by status-polling endpoints? [Clarity, Spec §FR-053, Spec §FR-056, Research §No webhook]
- [x] CHK019 Are AbacatePay env vars specified to be validated with Zod and never exposed? [Clarity, Spec §FR-054, Plan §Target Architecture, Tasks §T019]
- [x] CHK020 Is the gateway status -> `PaymentStatus` mapping specified deterministically? [Clarity, Spec §FR-055, Research §Status mapping]

## Layering And Architecture

- [x] CHK021 Is the domain boundary specified to avoid Prisma, Fastify, Zod, AbacatePay, and HTTP? [Consistency, Spec §FR-049, Spec §FR-061, Plan §Clean Layering, Tasks §Guardrails]
- [x] CHK022 Is the application boundary specified to depend on repository interfaces and the gateway port, not Prisma/AbacatePay? [Consistency, Spec §FR-062, Plan §Target Architecture]
- [x] CHK023 Is infrastructure specified as the home for Prisma repositories/mappers and the AbacatePay adapter? [Consistency, Spec §FR-063, Plan §Project Structure, Tasks §T014-T018]
- [x] CHK024 Is presentation specified as the home for Fastify routes/handlers and Zod schemas? [Consistency, Spec §FR-064, Tasks §T028-T031]

## API And Persistence Coverage

- [x] CHK025 Are all eight required endpoints represented in spec, plan, contract, and task coverage? [Completeness, Spec §API Endpoints and Payloads, Contract §paths, Tasks §Requested Order Mapping]
- [x] CHK026 Are persistence changes scoped to orders/items/payments, with the `[organizationId, token]` unique constraint and no inventory/freight/invoice tables? [Completeness, Data Model §Persistence Notes, Tasks §T009-T010]
- [x] CHK027 Is tenant isolation specified through mandatory `organizationId` and organization/order-scoped reads? [Clarity, Spec §FR-057, Data Model §Repository Contracts]
- [x] CHK028 Are not-found (order, payment, patient, product), conflict (already PAID), domain-violation, and gateway-failure behaviors specified with distinct errors? [Completeness, Spec §FR-058-FR-060, Contract §responses]

## Task Quality And Verification

- [x] CHK029 Are tasks small, objective, file-scoped, dependency-ordered, and without a broad generic "implement orders" task? [Clarity, Tasks §Domain-Validation]
- [x] CHK030 Are minimum tests planned for `DiscountRate`, domain invariants, price freezing, discount math, gateway interaction (fake port), adapter mapping (injectable fetch), use-case scoping, atomic persistence, and schemas? [Completeness, Plan §Testing, Tasks §Tests]
- [x] CHK031 Are final validation commands planned for Prisma generate, typecheck, lint, tests, and build? [Completeness, Plan §Commands de Validacao, Tasks §Validation]
- [x] CHK032 Is rollback documented for route registration, module removal, env reversal, `DiscountRate` removal, Prisma schema/migration reversal, Prisma generate, and validation reruns? [Recovery, Plan §Rollback]

## Result

- **Classification**: Pode implementar agora
- **Blocking Issues**: None
- **Rationale**: Spec, plan, data model, contract, quickstart, and tasks consistently constrain the feature to backend orders and AbacatePay-integrated payments, preserve DDD layering, exclude frontend/auth/RBAC/Correios/freight/inventory-write/split/refund/invoice/e-mail/prescription/webhook, never mutate `Product`/inventory, include all eight endpoints, isolate AbacatePay behind a port with status mapping and env validation, never leak gateway secrets, include test coverage and atomic-persistence guarantees, and provide rollback/validation steps. The documented scoping decisions (`BOLETO` unsupported, no webhook, only `cancel()` status transition, conditional patient product-access hook, guardian linkage via patient) are explicit and revisable without blocking implementation.

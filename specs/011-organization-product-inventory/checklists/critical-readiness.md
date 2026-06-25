# Critical Readiness Checklist: Controle Backend de Estoque de Produtos da Organizacao

**Purpose**: Gate pre-implementation readiness across scope, DDD boundaries, persistence planning, tasks, tests, and rollback
**Created**: 2026-06-23
**Feature**: [spec.md](../spec.md)
**Plan**: [plan.md](../plan.md)
**Tasks**: [tasks.md](../tasks.md)
**Classification**: Pode implementar agora

## Scope Boundaries

- [x] CHK001 Is the feature specified as backend-only, with affected package limited to API/documentation and frontend explicitly excluded? [Completeness, Spec §Input, Spec §Constitution Alignment, Plan §Summary]
- [x] CHK002 Are orders, order-bound reservations, prescriptions, checkout, and payments explicitly excluded? [Completeness, Spec §FR-047, Spec §Edge Cases, Plan §Constraints, Tasks §Guardrails]
- [x] CHK003 Are batch/lot, expiration, multiple stocks per product, stock transfers, upload, and images explicitly out of scope? [Completeness, Spec §FR-047, Plan §Summary, Tasks §Guardrails]
- [x] CHK004 Is the implementation task list free from frontend work and explicit about not altering `packages/web`? [Consistency, Plan §Constraints, Tasks §Phase 8, Tasks §Guardrails]
- [x] CHK005 Is it explicit that inventory operations never mutate `Product`? [Consistency, Spec §FR-029, Spec §Edge Cases, Plan §Constraints, Research §Product existence]

## Domain Model Requirements

- [x] CHK006 Is `InventoryItem` clearly specified as an Aggregate Root with `id`, `organizationId`, `productId`, `availableQuantity`, `reservedQuantity`, and `minimumQuantity`? [Completeness, Spec §FR-010-FR-011, Data Model §InventoryItem]
- [x] CHK007 Is `InventoryMovement` specified as an append-only audit Entity with the required fields and no update/delete? [Completeness, Spec §FR-030-FR-034, Data Model §InventoryMovement]
- [x] CHK008 Are the five domain methods (`addStock`, `reserve`, `releaseReservation`, `confirmStockOut`, `adjustStock`) specified with effects and movement types? [Clarity, Spec §FR-021-FR-026, Data Model §Domain Methods]
- [x] CHK009 Are nonnegativity invariants for available/reserved/minimum quantities specified? [Clarity, Spec §FR-015-FR-017, Data Model §Invariants]
- [x] CHK010 Are the reserve/release/out limit invariants specified (no reserve above available, no release/out above reserved)? [Clarity, Spec §FR-018-FR-020, Data Model §Domain Methods]
- [x] CHK011 Is the `InventoryMovementType` enum value set complete (`IN`, `OUT`, `RESERVE`, `RELEASE`, `ADJUSTMENT`)? [Completeness, Spec §FR-032, Data Model §Enums]
- [x] CHK012 Is the `Quantity` value object specified as integer and nonnegative and reused across item and movement? [Clarity, Spec §FR-041, Data Model §Value Objects, Research §Quantity]
- [x] CHK013 Is `createdByUserId` specified as required, request-supplied this phase, and unambiguous as the acting user? [Clarity, Spec §FR-035, Spec §Assumptions, Research §createdByUserId]
- [x] CHK014 Is "exactly one movement per successful operation" plus atomic item+movement persistence specified? [Completeness, Spec §FR-033, Spec §FR-036, Research §Atomic persistence]

## Layering And Architecture

- [x] CHK015 Is the domain boundary specified to avoid Prisma, Fastify, Zod, HTTP, and persistence dependencies? [Consistency, Spec §FR-043, Plan §Clean Layering, Tasks §Guardrails]
- [x] CHK016 Is the application boundary specified to depend on repository interfaces and to supply `createdByUserId`? [Consistency, Spec §FR-044, Plan §Target Architecture, Research §Domain methods]
- [x] CHK017 Is infrastructure specified as the home for Prisma repository and mappers? [Consistency, Spec §FR-045, Plan §Project Structure, Tasks §T013-T015]
- [x] CHK018 Is presentation specified as the home for Fastify routes/handlers and Zod schemas? [Consistency, Spec §FR-046, Plan §Current Architecture Analysis, Tasks §T024-T028]

## API And Persistence Coverage

- [x] CHK019 Are all eight required endpoints represented in spec, plan, contract, and task coverage? [Completeness, Spec §API Endpoints and Payloads, Plan §Target Architecture, Tasks §Requested Order Mapping]
- [x] CHK020 Are persistence changes scoped to inventory data, with the `[organizationId, productId]` unique constraint and no order/batch/expiration tables? [Completeness, Plan §Storage, Data Model §Persistence Notes, Tasks §T011-T012]
- [x] CHK021 Is tenant isolation specified through mandatory `organizationId` and organization/product-scoped reads? [Clarity, Spec §FR-037, Plan §Tenant Isolation, Data Model §Repository Contract]
- [x] CHK022 Are not-found (product, position) and conflict (duplicate position) behaviors specified with distinct errors? [Completeness, Spec §FR-038-FR-040, Spec §FR-042, Contract §responses]

## Task Quality And Verification

- [x] CHK023 Are tasks small, objective, file-scoped, dependency-ordered, and without a broad generic "implement inventory" task? [Clarity, Tasks §Phase 1-8]
- [x] CHK024 Are minimum tests planned for `Quantity`, domain invariants, movement generation, use case scoping, atomic persistence, and schemas? [Completeness, Plan §Testing, Tasks §Tests sections]
- [x] CHK025 Are final validation commands planned for Prisma generate, typecheck, lint, tests, and build? [Completeness, Plan §Commands de Validacao, Tasks §Phase 8]
- [x] CHK026 Is rollback documented for route registration, module removal, `Quantity` removal, Prisma schema/migration reversal, Prisma generate, and validation reruns? [Recovery, Plan §Rollback]

## Result

- **Classification**: Pode implementar agora
- **Blocking Issues**: None
- **Rationale**: Spec, plan, data model, contract, quickstart, and tasks consistently constrain the feature to backend inventory position and append-only movement auditing, preserve DDD layering, exclude orders/prescriptions/batch/expiration/upload/payment/RBAC, never mutate `Product`, include all eight endpoints, include test coverage and atomic-persistence guarantees, and provide rollback/validation steps. The two documented scoping decisions (integer `Quantity`, request-supplied `createdByUserId`) are explicit and revisable without blocking implementation.

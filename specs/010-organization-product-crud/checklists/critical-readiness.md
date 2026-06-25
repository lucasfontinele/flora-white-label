# Critical Readiness Checklist: CRUD Backend de Produtos da Organizacao

**Purpose**: Gate pre-implementation readiness across scope, DDD boundaries, persistence planning, tasks, tests, and rollback
**Created**: 2026-06-23
**Feature**: [spec.md](../spec.md)
**Plan**: [plan.md](../plan.md)
**Tasks**: [tasks.md](../tasks.md)
**Classification**: Pode implementar agora

## Scope Boundaries

- [x] CHK001 Is the feature specified as backend-only, with affected package limited to API/documentation and frontend explicitly excluded? [Completeness, Spec §Input, Spec §Constitution Alignment, Plan §Summary]
- [x] CHK002 Are stock/inventory requirements explicitly excluded, including no available quantity, lot/batch, expiration, `InventoryItem`, or `InventoryMovement`? [Completeness, Spec §FR-040, Spec §Edge Cases, Plan §Constraints, Tasks §Guardrails]
- [x] CHK003 Are orders, reservations, prescriptions, upload/images, custom categories, advanced permissions, and payments explicitly out of scope? [Completeness, Spec §FR-040, Plan §Summary, Tasks §Guardrails]
- [x] CHK004 Is the implementation task list free from frontend work and explicit about not altering `packages/web`? [Consistency, Plan §Constraints, Tasks §Phase 7, Tasks §Guardrails]

## Domain Model Requirements

- [x] CHK005 Is `Product` clearly specified as an Aggregate Root rather than a plain entity or infrastructure model? [Completeness, Spec §FR-009, Data Model §Product, Plan §Target Architecture]
- [x] CHK006 Is product tenant ownership unambiguous through mandatory `organizationId` and organization-scoped operations? [Clarity, Spec §FR-011, Spec §Tenant Ownership, Data Model §Relationships, Plan §Tenant Isolation]
- [x] CHK007 Is price specified through `MoneyInCents` and integer cent values, avoiding float/decimal/textual money inputs? [Clarity, Spec §FR-017, Spec §FR-018, Data Model §Validation Rules, Plan §Money]
- [x] CHK008 Are `category`, `type`, and `unit` specified as required fields with complete enum value sets? [Completeness, Spec §FR-013-FR-015, Spec §FR-032-FR-035, Data Model §Enums]
- [x] CHK009 Is `strainType` specified as optional with a constrained enum when present? [Clarity, Spec §FR-020, Spec §FR-034, Data Model §Fields]
- [x] CHK010 Are `thcPercentage` and `cbdPercentage` specified as optional and nonnegative when present? [Clarity, Spec §FR-021-FR-024, Data Model §Validation Rules]
- [x] CHK011 Are product active-state transitions specified for create, activate, deactivate, and logical delete? [Completeness, Spec §FR-025-FR-027, Data Model §State Transitions, Plan §Target Architecture]

## Layering And Architecture

- [x] CHK012 Is the domain boundary specified to avoid Prisma, Fastify, Zod, HTTP, and persistence dependencies? [Consistency, Spec §FR-036, Plan §Clean Layering, Tasks §Guardrails]
- [x] CHK013 Is the application boundary specified to depend on repository interfaces rather than Prisma directly? [Consistency, Spec §FR-037, Plan §Target Architecture, Tasks §Guardrails]
- [x] CHK014 Is infrastructure specified as the home for Prisma repository and mapper work? [Consistency, Spec §FR-038, Plan §Project Structure, Tasks §T011-T012]
- [x] CHK015 Is presentation specified as the home for Fastify routes/handlers and Zod schemas? [Consistency, Spec §FR-039, Plan §Current Architecture Analysis, Tasks §T019/T021/T028/T035/T044]

## API And Persistence Coverage

- [x] CHK016 Are all seven required endpoints represented in spec, plan, contract, and task coverage? [Completeness, Spec §API Endpoints and Payloads, Plan §Target Architecture, Tasks §Requested Order Mapping]
- [x] CHK017 Are persistence changes scoped to product catalog data, with migration planning only for the new Product schema need? [Completeness, Plan §Storage, Plan §Files To Create, Tasks §T008-T009]
- [x] CHK018 Is soft delete via `isActive = false` documented consistently across spec, plan, data model, contract, and tasks? [Consistency, Spec §Assumptions, Data Model §State Transitions, Plan §Research, Tasks §T040]

## Task Quality And Verification

- [x] CHK019 Are tasks small, objective, file-scoped, dependency-ordered, and without broad overlap such as a generic "implement products" task? [Clarity, Tasks §Phase 1-8]
- [x] CHK020 Are minimum tests planned for Product domain invariants, use cases, schemas, tenant isolation, and optional HTTP coverage? [Completeness, Plan §Testing, Tasks §T014-T016/T022-T024/T029-T030/T036-T038/T046]
- [x] CHK021 Are final validation commands planned for Prisma generate, typecheck, lint, tests, and build? [Completeness, Plan §Commands de Validacao, Tasks §Phase 8]
- [x] CHK022 Is rollback documented for route registration, module removal, Prisma schema/migration reversal, Prisma generate, and validation reruns? [Recovery, Plan §Rollback]

## Result

- **Classification**: Pode implementar agora
- **Blocking Issues**: None
- **Rationale**: Spec, plan, data model, contract, quickstart, and tasks consistently constrain the feature to backend product catalog CRUD, preserve DDD layering, exclude inventory/frontend/payment-related scope, include required endpoints, include test coverage, and provide rollback/validation steps.


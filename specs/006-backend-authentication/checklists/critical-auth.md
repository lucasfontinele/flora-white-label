# Critical Auth Readiness Checklist: Autenticação Backend

**Purpose**: Validate whether the authentication backend requirements, plan, and tasks are complete, bounded, and ready for implementation.
**Created**: 2026-06-19
**Feature**: [spec.md](../spec.md), [plan.md](../plan.md), [tasks.md](../tasks.md)

**Note**: This checklist validates requirements and planning quality before implementation. It does not verify implemented code.

## Endpoint Scope

- [x] CHK001 Are the requirements and tasks scoped to exactly one login endpoint, `POST /auth/login`, with all other auth endpoints excluded? [Completeness/Scope, Spec §FR-001, Spec §FR-002, Tasks T024]
- [x] CHK002 Are frontend, UI, cookies, IronSession, client-side middleware, and client-side integration explicitly excluded from the requirements and implementation tasks? [Scope Boundary, Spec §FR-026, Plan §Constraints, Tasks T030]
- [x] CHK003 Are logout, refresh token, `/me`, RBAC, authorization middleware, registration/cadastro, and password recovery explicitly excluded from this slice? [Scope Boundary, Spec §FR-002, Spec §FR-027, Plan §Constraints, Tasks T030]
- [x] CHK004 Are the tasks free of implementation work that changes the existing registration/cadastro flow? [Consistency, Spec §FR-002, Plan §No scope creep, Tasks T030]

## Layering And Dependency Boundaries

- [x] CHK005 Do the requirements and tasks require password validation through `HashService.verify` rather than direct hashing-library usage in the use case? [Layering, Spec §FR-008, Plan §Target Architecture, Tasks T017]
- [x] CHK006 Do the plan and tasks state that Argon2 remains isolated outside domain/application use-case code? [Layering, Plan §Constraints, Plan §Current Architecture Analysis, Tasks Scope Guardrails]
- [x] CHK007 Do the requirements and tasks require token generation through `JwtService.sign` rather than direct token-library usage in the use case? [Layering, Spec §FR-009, Plan §Target Architecture, Tasks T009-T010, Tasks T017]
- [x] CHK008 Do the plan and tasks state that `jose` remains isolated in infrastructure and does not appear in the use case? [Layering, Plan §Constraints, Plan §Target Architecture, Tasks Scope Guardrails]
- [x] CHK009 Is the domain/application boundary documented so domain code does not depend on Fastify, Prisma, Zod, Argon2, jose, or HTTP? [Clean Architecture, Spec §FR-028, Plan §Constitution Check, Plan §Post-Design Constitution Check]

## Response And Error Contract

- [x] CHK010 Do the requirements, plan, and tasks specify that `passwordHash`, password verification material, token secrets, and plaintext passwords are never returned? [Security/Completeness, Spec §FR-022, Spec §SC-004, Plan §Risks, Tasks T025]
- [x] CHK011 Is the invalid-credentials requirement generic for both unknown e-mail and wrong password, without revealing which condition failed? [Security/Clarity, Spec §FR-010, Spec §FR-011, Spec §US2, Tasks T020-T022]
- [x] CHK012 Are structured 400, 401, and 500 error expectations documented across the spec/contract/plan/tasks? [Completeness, Spec §Expected Errors, Contract §/auth/login responses, Plan §Error handling, Tasks T013, Tasks T023-T027]

## User Profiles And Context

- [x] CHK013 Is the view derivation from `UserProfile` explicitly defined for `Master`, `Organization`, `Patient`, and `Guardian`? [Clarity, Spec §FR-017, Spec §FR-018, Spec §FR-019, Spec §FR-020, Tasks T014, Tasks T017]
- [x] CHK014 Are `Master`, `Organization`, `Patient`, and `Guardian` all covered in scenarios, response consistency, success criteria, and tests? [Coverage, Spec §US1, Spec §FR-029, Spec §SC-001, Tasks T014]
- [x] CHK015 Is creation of the `Organization` user profile explicitly scoped to backend authentication without adding RBAC or authorization middleware? [Scope Boundary, Spec §FR-021, Plan §Target Architecture, Tasks Scope Guardrails]

## Test And Validation Readiness

- [x] CHK016 Are minimum tests planned for use-case behavior, schema validation, token signing, invalid credentials, response shape, and no `passwordHash` exposure? [Verification Completeness, Plan §Testing, Tasks T011, Tasks T014-T015, Tasks T020-T021, Tasks T025-T026]
- [x] CHK017 Is the absence of an existing HTTP route-test pattern acknowledged, with HTTP behavior covered by schema/use-case tests and quickstart scenarios unless a stub-friendly route pattern is introduced? [Test Strategy, Plan §Testing, Research §HTTP tests, Tasks Header, Quickstart §Manual API Scenarios]

## Classification

- [x] CHK018 Is the documentation set ready for implementation without returning to spec, plan, or tasks? [Readiness, Spec §Requirements, Plan §Implementation Order, Tasks §Dependencies & Execution Order]

## Findings

- The original critical checks are covered after incorporating the requested `Organization` user profile change.
- No task asks to implement frontend, cookies, IronSession, logout, refresh token, `/me`, RBAC, authorization middleware, cadastro/registration, or password recovery.
- The only explicit planning risk is the e-mail uniqueness mismatch: the plan documents it as a risk, but it does not block this implementation because the current spec intentionally defines login by e-mail/password only.

## Classification Result

**Pode implementar agora**

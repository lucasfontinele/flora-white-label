# Tasks: CRUD de Planos de Assinatura Master

**Input**: Design documents from `specs/004-subscription-plan-crud/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/subscription-plans.openapi.yaml](./contracts/subscription-plans.openapi.yaml), [quickstart.md](./quickstart.md)

**Tests**: Automated tests are required because this feature changes API contracts, validation, persistence, structured errors, and cross-entity delete safety. HTTP integration tests are only required if an existing project pattern is found during implementation.

**Organization**: Tasks are grouped by user story after shared setup/foundation, so each story can be implemented and verified independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after dependencies are met because it touches different files or only test files.
- **[Story]**: Maps to the user story in [spec.md](./spec.md).
- Every task line includes files, objective, dependencies, acceptance criteria, and required tests.

## Phase 1: Setup (Current Structure Review)

**Purpose**: Confirm current code shape before edits and prevent broad refactors.

- [X] T001 Files: `packages/api/src/modules/subscription-plans/domain/entities/SubscriptionPlan.ts`, `packages/api/src/shared/domain/value-objects/MoneyInCents.ts`; Objective: review current entity/value-object behavior and identify only the deltas needed for optional description, trim behavior, and cent-based money; Dependencies: none; Acceptance: implementation notes confirm `SubscriptionPlan` stays `Entity` and `MoneyInCents` is reused; Tests: no code test, review feeds T004/T005.
- [X] T002 [P] Files: `packages/api/prisma/schema.prisma`, `packages/api/prisma/migrations/20260618124142_subscription_plan_title_description/migration.sql`; Objective: inspect `SubscriptionPlan.description` nullability and migration safety before schema edits; Dependencies: none; Acceptance: decide whether to fix the existing unapplied migration or create a new migration for `description String?`; Tests: no code test, decision feeds T006.
- [X] T003 [P] Files: `packages/api/src/shared/presentation/http/fastify/app.ts`, `packages/api/src/shared/presentation/http/fastify/plugins/error-handler.ts`, `packages/api/src/config/env.ts`, `packages/api/src/**/*.test.ts`; Objective: review existing Fastify route registration, Zod usage, structured error handling, and test patterns; Dependencies: none; Acceptance: route/error/test approach matches existing API style and no new authorization middleware is planned; Tests: no code test, review feeds T009/T040.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared domain, persistence, repository, and error foundations required before story endpoints can be completed.

**Critical**: No user story implementation should be considered complete until this phase is complete.

- [X] T004 [P] Files: `packages/api/src/modules/subscription-plans/domain/entities/SubscriptionPlan.test.ts`, `packages/api/src/shared/domain/value-objects/MoneyInCents.test.ts`; Objective: add/adjust unit tests for title trim, optional/null description behavior, blank description rejection, positive integer limits, and `MoneyInCents` integer/non-negative rules; Dependencies: T001; Acceptance: tests describe required domain/value-object behavior and fail before implementation if behavior is missing; Tests: `pnpm test:api -- SubscriptionPlan MoneyInCents` after implementation.
- [X] T005 Files: `packages/api/src/modules/subscription-plans/domain/entities/SubscriptionPlan.ts`; Objective: adjust `SubscriptionPlan` domain rules without promoting it to `AggregateRoot` and without importing Fastify, Prisma, Zod, or HTTP concerns; Dependencies: T004; Acceptance: entity trims title/description, treats absent description as absent, rejects blank sent descriptions, preserves `MoneyInCents`, and validates positive integer limits; Tests: T004 tests pass.
- [X] T006 Files: `packages/api/prisma/schema.prisma`, `packages/api/prisma/migrations/20260618124142_subscription_plan_title_description/migration.sql`, `packages/api/prisma/migrations/20260618130000_subscription_plan_description_nullable/migration.sql`; Objective: align Prisma `SubscriptionPlan.description` with optional domain/API contract and preserve existing `Organization.currentPlanId` relation, using either the existing unapplied migration or the listed new migration path; Dependencies: T002; Acceptance: `description` is nullable in schema/migration, no billing fields are added, no new Organization link is introduced; Tests: `pnpm prisma:generate`.
- [X] T007 [P] Files: `packages/api/src/modules/subscription-plans/application/repositories/SubscriptionPlanRepository.ts`; Objective: define `SubscriptionPlanReadModel` and expand the repository port for `findById`, detail lookup, list, create, save/update, delete, and in-use check while preserving existing Organization use-case compatibility; Dependencies: T001; Acceptance: Application types expose timestamps through read model without adding timestamps to domain props; Tests: `pnpm typecheck:api`.
- [X] T008 [P] Files: `packages/api/src/shared/presentation/http/fastify/plugins/error-handler.ts`; Objective: map existing `NotFoundError` and `ConflictError` to structured 404 and 409 responses without changing domain errors; Dependencies: T003; Acceptance: global error handler returns `{ error, message }` for application not-found/conflict errors and still hides 500 details; Tests: covered by application/HTTP tests in later tasks and `pnpm test:api`.

**Checkpoint**: Domain, persistence contract, repository port, and shared error mapping are ready.

---

## Phase 3: User Story 1 - Criar Plano de Assinatura (Priority: P1) MVP

**Goal**: A backoffice master caller can create a subscription plan with valid title, optional description, integer cent price, and positive limits.

**Independent Test**: Send `POST /backoffice/subscription-plans` with valid data and verify HTTP 201 response returns the created plan with `priceInCents`; invalid body returns HTTP 400 and creates nothing.

### Tests for User Story 1

- [X] T009 [P] [US1] Files: `packages/api/src/modules/subscription-plans/application/use-cases/CreateSubscriptionPlanUseCase.test.ts`; Objective: add unit tests for successful create, null/omitted description, invalid title, invalid money, and invalid limits using an in-memory repository; Dependencies: T007; Acceptance: tests assert created read model has `id`, `priceInCents`, limits, and timestamps; Tests: this file plus `pnpm test:api -- CreateSubscriptionPlanUseCase`.
- [X] T010 [P] [US1] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-schemas.test.ts`; Objective: add schema tests for create body accepting integer cents/null description and rejecting decimals, negative cents, blank title, blank sent description, non-positive limits, and extra fields; Dependencies: T003; Acceptance: Zod schema behavior matches contract and spec validation rules; Tests: this file plus `pnpm test:api -- subscription-plan-schemas`.

### Implementation for User Story 1

- [X] T011 [US1] Files: `packages/api/src/modules/subscription-plans/application/use-cases/CreateSubscriptionPlanUseCase.ts`; Objective: create use case that builds `SubscriptionPlan` with `MoneyInCents`, persists through repository, and returns `SubscriptionPlanReadModel`; Dependencies: T005, T007, T009; Acceptance: no Prisma/Fastify/Zod imports in use case and all T009 scenarios pass; Tests: T009.
- [X] T012 [US1] Files: `packages/api/src/modules/subscription-plans/infrastructure/prisma/SubscriptionPlanMapper.ts`; Objective: extend mapper to convert Prisma records to domain/read model and domain to persistence with nullable description and `priceInCents`; Dependencies: T005, T007; Acceptance: mapper handles `description: null` and preserves integer cents; Tests: exercised by repository/use-case tests and `pnpm typecheck:api`.
- [X] T013 [US1] Files: `packages/api/src/modules/subscription-plans/infrastructure/prisma/PrismaSubscriptionPlanRepository.ts`; Objective: implement repository `create` support using `SubscriptionPlanMapper` and returning persisted read model; Dependencies: T006, T007, T012; Acceptance: create writes title, nullable description, `priceInCents`, limits, and returns timestamps; Tests: T009 with fake repository plus `pnpm typecheck:api`.
- [X] T014 [US1] Files: `packages/api/src/modules/subscription-plans/infrastructure/create-subscription-plan-use-cases.factory.ts`; Objective: create factory wiring `PrismaTransactionManager`, `PrismaSubscriptionPlanRepository`, and `CreateSubscriptionPlanUseCase`; Dependencies: T011, T013; Acceptance: factory accepts `PrismaService` and does not wire frontend/auth concerns; Tests: `pnpm typecheck:api`.
- [X] T015 [US1] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-schemas.ts`; Objective: create Zod create/write body schema with strict object validation and integer cent/positive limit rules; Dependencies: T010; Acceptance: schema exports typed create input for handlers and T010 create-schema tests pass; Tests: T010.
- [X] T016 [US1] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-presenter.ts`; Objective: create presenter that serializes `SubscriptionPlanReadModel` to API response with ISO timestamps and nullable description; Dependencies: T007; Acceptance: presenter output matches OpenAPI `SubscriptionPlanResponse`; Tests: covered by route tests if T040 applies and `pnpm typecheck:api`.
- [X] T017 [US1] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-routes.ts`; Objective: add Fastify route plugin with `POST /backoffice/subscription-plans`, local Zod `safeParse`, create use case call, 201 response, and 400 validation response; Dependencies: T014, T015, T016; Acceptance: handler contains no domain validation duplication and no new auth middleware; Tests: T010 plus T040 if HTTP pattern exists.
- [X] T018 [US1] Files: `packages/api/src/shared/presentation/http/fastify/app.ts`; Objective: register the subscription-plan route plugin in the Fastify app after global plugins; Dependencies: T017; Acceptance: route is reachable through `/backoffice/subscription-plans`; Tests: T040 if HTTP pattern exists and manual quickstart create scenario.

**Checkpoint**: US1 create flow is independently testable as MVP.

---

## Phase 4: User Story 2 - Consultar Planos de Assinatura (Priority: P2)

**Goal**: A backoffice master caller can list all plans and retrieve one plan by ID.

**Independent Test**: Create seed/fake plans, call `GET /backoffice/subscription-plans` and `GET /backoffice/subscription-plans/:id`, and verify list/detail responses plus 404 for missing ID.

### Tests for User Story 2

- [X] T019 [P] [US2] Files: `packages/api/src/modules/subscription-plans/application/use-cases/ListSubscriptionPlansUseCase.test.ts`; Objective: add unit tests for listing multiple plans and empty list using in-memory repository read models; Dependencies: T007; Acceptance: tests assert `{ data: [] }`-ready output and cent values remain integers; Tests: this file plus `pnpm test:api -- ListSubscriptionPlansUseCase`.
- [X] T020 [P] [US2] Files: `packages/api/src/modules/subscription-plans/application/use-cases/GetSubscriptionPlanByIdUseCase.test.ts`; Objective: add unit tests for existing plan detail and missing plan `NotFoundError`; Dependencies: T007, T008; Acceptance: tests assert full read model on success and not-found on unknown ID; Tests: this file plus `pnpm test:api -- GetSubscriptionPlanByIdUseCase`.
- [X] T021 [P] [US2] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-schemas.test.ts`; Objective: extend schema tests for route params accepting nonblank ID and rejecting blank/malformed params according to chosen project convention; Dependencies: T010; Acceptance: params schema behavior is explicit before GET handlers use it; Tests: `pnpm test:api -- subscription-plan-schemas`.

### Implementation for User Story 2

- [X] T022 [US2] Files: `packages/api/src/modules/subscription-plans/application/use-cases/ListSubscriptionPlansUseCase.ts`; Objective: create use case that returns all plan read models without pagination/filtering; Dependencies: T007, T019; Acceptance: no Prisma/Fastify imports and empty catalog returns an empty array; Tests: T019.
- [X] T023 [US2] Files: `packages/api/src/modules/subscription-plans/application/use-cases/GetSubscriptionPlanByIdUseCase.ts`; Objective: create get-by-id use case that returns one read model or throws `NotFoundError`; Dependencies: T007, T020; Acceptance: use case depends only on repository port and application error; Tests: T020.
- [X] T024 [US2] Files: `packages/api/src/modules/subscription-plans/infrastructure/prisma/PrismaSubscriptionPlanRepository.ts`; Objective: implement `findAllDetails` and `findDetailsById` using Prisma and `SubscriptionPlanMapper`; Dependencies: T012, T022, T023; Acceptance: list/detail return read models with timestamps and nullable description; Tests: T019, T020, `pnpm typecheck:api`.
- [X] T025 [US2] Files: `packages/api/src/modules/subscription-plans/infrastructure/create-subscription-plan-use-cases.factory.ts`; Objective: extend factory to wire `ListSubscriptionPlansUseCase` and `GetSubscriptionPlanByIdUseCase`; Dependencies: T022, T023, T024; Acceptance: route layer can obtain create/list/get use cases from one factory without duplicate Prisma wiring; Tests: `pnpm typecheck:api`.
- [X] T026 [US2] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-schemas.ts`; Objective: export Zod params schema for `:id` and list response typing helpers if needed; Dependencies: T021; Acceptance: GET handlers can validate params locally and return 400 on invalid params; Tests: T021.
- [X] T027 [US2] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-routes.ts`; Objective: add `GET /backoffice/subscription-plans` and `GET /backoffice/subscription-plans/:id` handlers with presenter mapping and 404 propagation; Dependencies: T025, T026; Acceptance: list returns `{ data: [...] }`, detail returns one plan, unknown ID maps to structured 404; Tests: T019, T020, T040 if HTTP pattern exists, manual quickstart list/get scenarios.

**Checkpoint**: US2 query flows work independently and do not require update/delete.

---

## Phase 5: User Story 3 - Atualizar Plano de Assinatura (Priority: P3)

**Goal**: A backoffice master caller can fully replace editable plan fields through `PUT`.

**Independent Test**: Create a plan, call `PUT /backoffice/subscription-plans/:id` with all required fields, and verify later detail response returns updated values while invalid updates preserve previous data.

### Tests for User Story 3

- [X] T028 [P] [US3] Files: `packages/api/src/modules/subscription-plans/application/use-cases/UpdateSubscriptionPlanUseCase.test.ts`; Objective: add unit tests for successful full update, null description, missing plan `NotFoundError`, invalid fields, and preservation of existing data on failure using in-memory repository; Dependencies: T007, T008; Acceptance: tests assert update returns read model and repository state is unchanged on validation/not-found; Tests: this file plus `pnpm test:api -- UpdateSubscriptionPlanUseCase`.
- [X] T029 [P] [US3] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-schemas.test.ts`; Objective: extend schema tests for PUT body requiring all mandatory fields and rejecting partial updates, extra fields, decimals, negative cents, and non-positive limits; Dependencies: T010; Acceptance: update body schema matches full replacement contract; Tests: `pnpm test:api -- subscription-plan-schemas`.

### Implementation for User Story 3

- [X] T030 [US3] Files: `packages/api/src/modules/subscription-plans/application/use-cases/UpdateSubscriptionPlanUseCase.ts`; Objective: create update use case that checks plan existence, rebuilds `SubscriptionPlan` with same ID, saves through repository, and returns read model; Dependencies: T005, T007, T028; Acceptance: missing plan throws `NotFoundError`, invalid input fails before save, and no Prisma/Fastify imports exist; Tests: T028.
- [X] T031 [US3] Files: `packages/api/src/modules/subscription-plans/infrastructure/prisma/PrismaSubscriptionPlanRepository.ts`; Objective: implement repository `save`/update using Prisma update and mapper read model output; Dependencies: T012, T030; Acceptance: update persists nullable description and integer cents and returns updated timestamp from persistence; Tests: T028, `pnpm typecheck:api`.
- [X] T032 [US3] Files: `packages/api/src/modules/subscription-plans/infrastructure/create-subscription-plan-use-cases.factory.ts`; Objective: extend factory to wire `UpdateSubscriptionPlanUseCase`; Dependencies: T030, T031; Acceptance: route layer obtains update use case from existing factory; Tests: `pnpm typecheck:api`.
- [X] T033 [US3] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-schemas.ts`; Objective: expose/update strict Zod write schema for PUT full replacement using the same validation rules as create; Dependencies: T029; Acceptance: partial update payloads fail with 400 and no handler-specific validation duplication is needed; Tests: T029.
- [X] T034 [US3] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-routes.ts`; Objective: add `PUT /backoffice/subscription-plans/:id` handler with params/body validation, update use case call, presenter response, and structured 404 handling; Dependencies: T026, T032, T033; Acceptance: valid PUT returns 200 updated plan and invalid body returns 400 before use case; Tests: T028, T029, T040 if HTTP pattern exists, manual quickstart update scenario.

**Checkpoint**: US3 update flow works independently after create/get support.

---

## Phase 6: User Story 4 - Remover Plano de Assinatura (Priority: P4)

**Goal**: A backoffice master caller can delete an unused plan and receives conflict when the plan is referenced by organizations.

**Independent Test**: Delete a plan with no organizations and verify 204 plus later 404; attempt to delete a used plan and verify 409 while the plan remains available.

### Tests for User Story 4

- [X] T035 [P] [US4] Files: `packages/api/src/modules/subscription-plans/application/use-cases/DeleteSubscriptionPlanUseCase.test.ts`; Objective: add unit tests for successful delete, missing plan `NotFoundError`, used plan `ConflictError`, and no deletion when conflict occurs; Dependencies: T007, T008; Acceptance: tests assert repository delete is only called for existing unused plans; Tests: this file plus `pnpm test:api -- DeleteSubscriptionPlanUseCase`.

### Implementation for User Story 4

- [X] T036 [US4] Files: `packages/api/src/modules/subscription-plans/application/use-cases/DeleteSubscriptionPlanUseCase.ts`; Objective: create delete use case that verifies existence, checks organization usage, throws `ConflictError` when in use, and deletes unused plans; Dependencies: T007, T035; Acceptance: no Organization domain changes, no billing logic, and all T035 scenarios pass; Tests: T035.
- [X] T037 [US4] Files: `packages/api/src/modules/subscription-plans/infrastructure/prisma/PrismaSubscriptionPlanRepository.ts`; Objective: implement `hasOrganizations` and `delete` using existing `Organization.currentPlanId` relationship and Prisma delete; Dependencies: T006, T036; Acceptance: used plans are detected before delete and unused delete removes only `subscription_plans` row; Tests: T035, `pnpm typecheck:api`.
- [X] T038 [US4] Files: `packages/api/src/modules/subscription-plans/infrastructure/create-subscription-plan-use-cases.factory.ts`; Objective: extend factory to wire `DeleteSubscriptionPlanUseCase`; Dependencies: T036, T037; Acceptance: route layer obtains delete use case from existing factory; Tests: `pnpm typecheck:api`.
- [X] T039 [US4] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-routes.ts`; Objective: add `DELETE /backoffice/subscription-plans/:id` handler with params validation, delete use case call, 204 response, structured 404 and 409 propagation; Dependencies: T026, T038; Acceptance: successful delete has no body and used-plan conflict returns structured 409; Tests: T035, T040 if HTTP pattern exists, manual quickstart delete/conflict scenarios.

**Checkpoint**: US4 delete flow works and preserves Organization references.

---

## Phase 7: Cross-Cutting Verification & Polish

**Purpose**: Validate route coverage, documentation alignment, and quality gates without adding unrelated refactors.

- [X] T040 [P] Files: `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-routes.test.ts`, `specs/004-subscription-plan-crud/quickstart.md`; Objective: create HTTP integration tests with Fastify inject only if an existing project HTTP test pattern is present; otherwise document manual quickstart validation as the accepted path; Dependencies: T018, T027, T034, T039; Acceptance: no new broad test framework is introduced, and create/list/get/update/delete validation is covered either by existing-pattern HTTP tests or documented manual quickstart checks; Tests: `pnpm test:api` if test file is created, otherwise quickstart manual scenarios.
- [X] T041 [P] Files: `specs/004-subscription-plan-crud/contracts/subscription-plans.openapi.yaml`, `specs/004-subscription-plan-crud/quickstart.md`; Objective: reconcile contract and quickstart with final route names, response shapes, nullable description behavior, and validation/error mapping; Dependencies: T017, T027, T034, T039; Acceptance: docs match implemented endpoints and no frontend/shared contract work is introduced; Tests: manual review plus `ruby -e 'require "yaml"; YAML.load_file("specs/004-subscription-plan-crud/contracts/subscription-plans.openapi.yaml")'`.
- [X] T042 Files: `packages/api/prisma/schema.prisma`; Objective: run Prisma generation after schema/migration changes; Dependencies: T006, T037; Acceptance: Prisma client is regenerated successfully without schema errors; Tests: `pnpm prisma:generate`.
- [X] T043 Files: `packages/api/src`, `packages/api/prisma/schema.prisma`; Objective: run API typecheck for all new domain/application/infrastructure/presentation code; Dependencies: T011-T039; Acceptance: TypeScript passes with strict settings; Tests: `pnpm typecheck:api`.
- [X] T044 Files: `packages/api/src`, `packages/api/eslint.config.js`; Objective: run API lint after implementation without broad formatting churn; Dependencies: T011-T039; Acceptance: lint passes or only intentional issues are fixed in touched files; Tests: `pnpm --filter @flora/api lint`.
- [X] T045 Files: `packages/api/src/**/*.test.ts`; Objective: run API automated tests covering domain/value object, use cases, schemas, and optional HTTP integration; Dependencies: T004, T009, T010, T019, T020, T021, T028, T029, T035, T040; Acceptance: all API tests pass; Tests: `pnpm test:api`.
- [X] T046 Files: `packages/api/src`, `packages/api/prisma/schema.prisma`, `package.json`; Objective: run final API build and repository gates if required before review; Dependencies: T042, T043, T044, T045; Acceptance: API build passes and repo-wide gates are green if run; Tests: `pnpm build:api`, optionally `pnpm typecheck` and `pnpm build`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: starts immediately.
- **Phase 2 Foundational**: depends on Phase 1 review results and blocks user-story completion.
- **US1 Create (Phase 3)**: depends on Foundation and is the MVP scope.
- **US2 Consult (Phase 4)**: depends on Foundation; detail verification benefits from US1-created records but list/get use cases remain independently testable with fakes.
- **US3 Update (Phase 5)**: depends on Foundation and benefits from US1/US2 for end-to-end manual validation.
- **US4 Delete (Phase 6)**: depends on Foundation and Organization reference already present in Prisma.
- **Phase 7 Polish**: depends on selected story phases being complete.

### User Story Dependencies

- **US1 (P1)**: no dependency on other stories after Foundation.
- **US2 (P2)**: no dependency on US3/US4; manual detail validation can use records created by US1.
- **US3 (P3)**: requires an existing plan for manual validation, normally created by US1.
- **US4 (P4)**: requires an existing unused plan and, for conflict validation, a plan referenced by Organization.

### Implementation Order Alignment

1. T001, T004, T005 cover `SubscriptionPlan` and `MoneyInCents`.
2. T002, T006 cover Prisma schema/migration.
3. T007 covers `SubscriptionPlanRepository`.
4. T009, T011 cover `CreateSubscriptionPlanUseCase`.
5. T019, T022 cover `ListSubscriptionPlansUseCase`.
6. T020, T023 cover `GetSubscriptionPlanByIdUseCase`.
7. T028, T030 cover `UpdateSubscriptionPlanUseCase`.
8. T035, T036 cover `DeleteSubscriptionPlanUseCase`.
9. T012 covers `SubscriptionPlanMapper`.
10. T013, T024, T031, T037 cover `PrismaSubscriptionPlanRepository`.
11. T010, T015, T021, T026, T029, T033 cover Zod schemas.
12. T017, T027, T034, T039 cover Fastify handlers/controllers.
13. T017, T027, T034, T039 cover Fastify routes.
14. T018 covers route registration in the app.
15. T004 covers value object/entity unit tests.
16. T009, T019, T020, T028, T035 cover use case unit tests.
17. T040 covers HTTP integration tests only if a project pattern exists.
18. T043 runs typecheck.
19. T044 runs lint.
20. T045 runs tests.

---

## Parallel Opportunities

- T002 and T003 can run in parallel with T001.
- T004 and T007 can run in parallel after T001 because they touch test/repository files.
- T009 and T010 can run in parallel for US1.
- T019, T020, and T021 can run in parallel for US2.
- T028 and T029 can run in parallel for US3.
- T035 can run in parallel with documentation review once Foundation is complete.
- T040 and T041 can run in parallel after route behavior stabilizes.

## Parallel Example: User Story 1

```text
Task: "T009 Create CreateSubscriptionPlanUseCase unit tests in packages/api/src/modules/subscription-plans/application/use-cases/CreateSubscriptionPlanUseCase.test.ts"
Task: "T010 Create create-body Zod schema tests in packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-schemas.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "T019 Create ListSubscriptionPlansUseCase tests in packages/api/src/modules/subscription-plans/application/use-cases/ListSubscriptionPlansUseCase.test.ts"
Task: "T020 Create GetSubscriptionPlanByIdUseCase tests in packages/api/src/modules/subscription-plans/application/use-cases/GetSubscriptionPlanByIdUseCase.test.ts"
Task: "T021 Extend schema tests for route params in packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-schemas.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "T028 Create UpdateSubscriptionPlanUseCase tests in packages/api/src/modules/subscription-plans/application/use-cases/UpdateSubscriptionPlanUseCase.test.ts"
Task: "T029 Extend schema tests for PUT body in packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-schemas.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 tasks T009-T018.
3. Validate `POST /backoffice/subscription-plans` manually through quickstart and automated unit/schema tests.
4. Stop before list/update/delete if only MVP create behavior is needed.

### Incremental Delivery

1. Foundation: domain, schema, repository port, error mapping.
2. US1: create plan.
3. US2: list/get plan.
4. US3: update plan.
5. US4: delete plan with in-use conflict.
6. Cross-cutting validation gates.

### Scope Guardrails

- Do not create frontend files.
- Do not change authentication or add new authorization middleware.
- Do not add billing rules.
- Do not add new Organization behavior beyond existing reference checks.
- Do not promote `SubscriptionPlan` to `AggregateRoot`.
- Do not introduce shared contracts in `packages/shared` unless a hard existing project requirement is discovered.

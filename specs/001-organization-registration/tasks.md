# Tasks: Organization Registration

**Input**: Design documents from `/specs/001-organization-registration/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/)

**Tests**: Automated tests are included because this feature changes API contracts, tenant isolation, validation, persistence, authorization, and cent-based monetary behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **API**: `packages/api/src`, `packages/api/prisma`
- **Web app**: `packages/web/app`, `packages/web/components`, `packages/web/lib`
- **Feature docs/contracts**: `specs/001-organization-registration`
- **Root config**: `package.json`

---

## Phase 1: Setup (Shared Test and Route Infrastructure)

**Purpose**: Add minimal project wiring needed before story-specific test and implementation work.

- [X] T001 Add repository test script orchestration and Vitest workspace dev dependency entries in `package.json`
- [X] T002 Add API test script and Vitest config in `packages/api/package.json` and `packages/api/vitest.config.ts`
- [X] T003 [P] Add web test script and Vitest config in `packages/web/package.json` and `packages/web/vitest.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared schema, migration, validation, and authorization primitives required by every user story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Update Prisma models for Address, Organization, and SubscriptionPlan in `packages/api/prisma/schema.prisma`
- [X] T005 Create migration with organization tables, plan tables, CNPJ uniqueness, and Starter/Growth/Unlimited seed inserts in `packages/api/prisma/migrations/20260616000000_organization_registration/migration.sql`
- [X] T006 [P] Add reusable digit, CNPJ, CEP, phone, date, and Brazilian UF validators in `packages/api/src/domain/shared/validation.ts`
- [X] T007 [P] Add reusable money-in-cents formatting/parsing helpers in `packages/web/lib/money.ts`
- [X] T008 Add Master authorization plugin that exposes authenticated Master context in `packages/api/src/communication/http/plugins/master-auth.ts`
- [X] T009 Add forbidden application exception and export it in `packages/api/src/exception/forbidden-exception.ts` and `packages/api/src/exception/index.ts`
- [X] T010 Register Master authorization plugin in the server bootstrap in `packages/api/src/communication/http/build-server.ts`

**Checkpoint**: Foundational schema, validation, authorization, and test wiring are ready.

---

## Phase 3: User Story 1 - Register an Organization (Priority: P1) MVP

**Goal**: A Master user can register an organization with valid company data, reusable address data, and a selected plan, while duplicate/invalid submissions are rejected without partial creation.

**Independent Test**: Submit valid company data, address data, and plan data as a Master user and verify the created organization contains all submitted information, has a tenant boundary, records the creating Master, and rejects invalid, duplicate, and non-Master attempts.

### Tests for User Story 1

> Write these tests first and confirm they fail before implementation.

- [X] T011 [P] [US1] Add organization registration validation tests for CNPJ, company data, address data, and future foundation dates in `packages/api/src/domain/organizations/organization-registration.test.ts`
- [X] T012 [P] [US1] Add POST `/organizations` API tests for 201, 400, 401, 403, and 409 responses in `packages/api/src/communication/http/routes/organizations-routes.test.ts`
- [X] T013 [P] [US1] Add Prisma repository tests for atomic organization creation and duplicate CNPJ rejection in `packages/api/src/infrastructure/database/prisma-organization-repository.test.ts`
- [X] T014 [P] [US1] Add web organization registration schema tests for required fields, optional complement, optional secondary CNAEs, and cents-safe plan input in `packages/web/app/(master)/organizations/schemas/organization-registration-schema.test.ts`

### Implementation for User Story 1

- [ ] T015 [US1] Implement Address value object with normalization and validation in `packages/api/src/domain/addresses/address.ts`
- [ ] T016 [US1] Implement Organization aggregate with tenant identity and selected plan relationship in `packages/api/src/domain/organizations/organization.ts`
- [ ] T017 [US1] Implement organization registration input parsing and domain validation in `packages/api/src/domain/organizations/organization-registration.ts`
- [ ] T018 [US1] Define organization repository port for CNPJ lookup and atomic creation in `packages/api/src/application/organizations/organization-repository.ts`
- [ ] T019 [US1] Implement create organization use case with Master authorization, plan lookup, and atomic create behavior in `packages/api/src/application/organizations/create-organization-use-case.ts`
- [ ] T020 [US1] Implement Prisma organization repository for Address and Organization writes in `packages/api/src/infrastructure/database/prisma-organization-repository.ts`
- [ ] T021 [US1] Implement POST `/organizations` route with structured errors in `packages/api/src/communication/http/routes/organizations-routes.ts`
- [ ] T022 [US1] Register organizations routes in `packages/api/src/communication/http/build-server.ts`
- [ ] T023 [US1] Add Master organization registration schema in `packages/web/app/(master)/organizations/schemas/organization-registration-schema.ts`
- [ ] T024 [US1] Add create organization request wrapper in `packages/web/app/(master)/organizations/requests/create-organization.ts`
- [ ] T025 [US1] Add Master organization feature types in `packages/web/app/(master)/organizations/types.ts`
- [ ] T026 [US1] Implement organization registration form with company and address sections in `packages/web/app/(master)/organizations/components/organization-registration-form.tsx`
- [ ] T027 [US1] Add Master organization creation page in `packages/web/app/(master)/organizations/new/page.tsx`
- [ ] T028 [US1] Add duplicate CNPJ, validation, and authorization error mapping in `packages/web/app/(master)/organizations/components/organization-registration-form.tsx`

**Checkpoint**: User Story 1 is complete when a Master can create an organization and invalid/duplicate/non-Master submissions fail without partial creation.

---

## Phase 4: User Story 2 - Select a Standard Plan (Priority: P2)

**Goal**: Starter, Growth, and Unlimited plans are available during organization registration with exact cent prices and usage limits.

**Independent Test**: Open the plan catalog or registration flow and verify Starter, Growth, and Unlimited display and persist the exact required prices, operator limits, and active user limits.

### Tests for User Story 2

> Write these tests first and confirm they fail before implementation.

- [ ] T029 [P] [US2] Add SubscriptionPlan domain tests for cent prices, active user limits, and unlimited operator semantics in `packages/api/src/domain/subscription-plans/subscription-plan.test.ts`
- [ ] T030 [P] [US2] Add GET `/subscription-plans` API tests for default plan payloads in `packages/api/src/communication/http/routes/subscription-plans-routes.test.ts`
- [ ] T031 [P] [US2] Add subscription plan select component tests for Starter, Growth, and Unlimited display in `packages/web/app/(master)/organizations/components/subscription-plan-select.test.tsx`

### Implementation for User Story 2

- [ ] T032 [US2] Implement SubscriptionPlan reference model and unlimited operator rules in `packages/api/src/domain/subscription-plans/subscription-plan.ts`
- [ ] T033 [US2] Define subscription plan repository port in `packages/api/src/application/subscription-plans/subscription-plan-repository.ts`
- [ ] T034 [US2] Implement list subscription plans use case in `packages/api/src/application/subscription-plans/list-subscription-plans-use-case.ts`
- [ ] T035 [US2] Implement Prisma subscription plan repository in `packages/api/src/infrastructure/database/prisma-subscription-plan-repository.ts`
- [ ] T036 [US2] Implement GET `/subscription-plans` route in `packages/api/src/communication/http/routes/subscription-plans-routes.ts`
- [ ] T037 [US2] Register subscription plan routes in `packages/api/src/communication/http/build-server.ts`
- [ ] T038 [US2] Add get subscription plans request wrapper in `packages/web/app/(master)/organizations/requests/get-subscription-plans.ts`
- [ ] T039 [US2] Add subscription plans query hook in `packages/web/app/(master)/organizations/queries/use-subscription-plans-query.ts`
- [ ] T040 [US2] Implement subscription plan select component with cents-based display in `packages/web/app/(master)/organizations/components/subscription-plan-select.tsx`
- [ ] T041 [US2] Wire subscription plan loading and selection into `packages/web/app/(master)/organizations/components/organization-registration-form.tsx`

**Checkpoint**: User Story 2 is complete when the three default plans are returned, displayed, selectable, and associated with organization creation.

---

## Phase 5: User Story 3 - Establish Organization Domain Boundaries (Priority: P3)

**Goal**: Organization is explicit as aggregate root, Address is reusable, and Subscription Plan remains independent reference data for future features.

**Independent Test**: Review code and docs to confirm Organization owns tenant identity and lifecycle, Address is reusable outside Organization, and Subscription Plan is reference data selected by organizations.

### Tests for User Story 3

> Write these tests first and confirm they fail before implementation.

- [ ] T042 [P] [US3] Add aggregate-boundary tests for Organization, Address ownership, and SubscriptionPlan reference behavior in `packages/api/src/domain/organizations/organization-boundary.test.ts`
- [ ] T043 [P] [US3] Add reusable web address schema tests for organization and future user forms in `packages/web/lib/address-schema.test.ts`

### Implementation for User Story 3

- [ ] T044 [US3] Extract reusable web address schema helper in `packages/web/lib/address-schema.ts`
- [ ] T045 [US3] Update organization registration schema to consume the reusable address schema in `packages/web/app/(master)/organizations/schemas/organization-registration-schema.ts`
- [ ] T046 [P] [US3] Document Organization aggregate root, Address value object, and SubscriptionPlan reference boundaries in `packages/api/src/domain/README.md`
- [ ] T047 [P] [US3] Document application-layer dependency direction for Organization use cases in `packages/api/src/application/README.md`
- [ ] T048 [US3] Update shared contract notes with future `packages/shared` migration rules in `specs/001-organization-registration/contracts/shared-contracts.md`

**Checkpoint**: User Story 3 is complete when the domain boundaries are enforced by tests and documented for future features.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation alignment, and quality gates across all user stories.

- [ ] T049 [P] Update README with Master organization workflow and default plan values in `README.md`
- [ ] T050 [P] Add post-implementation validation result placeholders to `specs/001-organization-registration/quickstart.md`
- [ ] T051 Run `pnpm prisma:generate` after schema changes and verify generated client usage from `packages/api/prisma/schema.prisma`
- [ ] T052 Run `pnpm typecheck:api` and fix API type errors referenced from `packages/api/package.json`
- [ ] T053 Run `pnpm typecheck:web` and fix web type errors referenced from `packages/web/package.json`
- [ ] T054 Run `pnpm typecheck` from the root workspace using `package.json`
- [ ] T055 Run `pnpm build` from the root workspace using `package.json`
- [ ] T056 Execute quickstart validation scenarios and record the outcome in `specs/001-organization-registration/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion; delivers MVP organization registration.
- **User Story 2 (Phase 4)**: Depends on Foundational completion and integrates with US1 form when both are present.
- **User Story 3 (Phase 5)**: Depends on Foundational completion and can run after or alongside story implementation once the relevant files exist.
- **Polish (Phase 6)**: Depends on all implemented stories.

### User Story Dependencies

- **US1 - Register an Organization**: Required MVP. Needs seeded plan data from Foundational phase.
- **US2 - Select a Standard Plan**: Can be developed after Foundational; full UI integration is easiest after US1 form exists.
- **US3 - Establish Domain Boundaries**: Can be developed after Foundational; documentation tasks can run in parallel with US1/US2.

### Within Each User Story

- Tests MUST be written and fail before implementation tasks.
- Domain models and validation before application use cases.
- Application use cases before HTTP routes.
- API routes before web request/query integration.
- Web schemas before form components.
- Story checkpoint must pass before moving to later polish work.

---

## Parallel Opportunities

- Setup T002 and T003 can run in parallel after T001 is understood.
- Foundational T006 and T007 can run in parallel after T004/T005 are planned.
- US1 tests T011, T012, T013, and T014 can run in parallel.
- US2 tests T029, T030, and T031 can run in parallel.
- US3 tests T042 and T043 can run in parallel.
- Documentation tasks T046, T047, T048, T049, and T050 can run in parallel with code validation once implementation decisions are stable.

---

## Parallel Example: User Story 1

```bash
Task: "T011 Add organization registration validation tests in packages/api/src/domain/organizations/organization-registration.test.ts"
Task: "T012 Add POST /organizations API tests in packages/api/src/communication/http/routes/organizations-routes.test.ts"
Task: "T013 Add Prisma repository tests in packages/api/src/infrastructure/database/prisma-organization-repository.test.ts"
Task: "T014 Add web schema tests in packages/web/app/(master)/organizations/schemas/organization-registration-schema.test.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T029 Add SubscriptionPlan domain tests in packages/api/src/domain/subscription-plans/subscription-plan.test.ts"
Task: "T030 Add GET /subscription-plans API tests in packages/api/src/communication/http/routes/subscription-plans-routes.test.ts"
Task: "T031 Add subscription plan select tests in packages/web/app/(master)/organizations/components/subscription-plan-select.test.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "T042 Add aggregate-boundary tests in packages/api/src/domain/organizations/organization-boundary.test.ts"
Task: "T043 Add reusable web address schema tests in packages/web/lib/address-schema.test.ts"
Task: "T046 Document domain boundaries in packages/api/src/domain/README.md"
Task: "T047 Document application boundaries in packages/api/src/application/README.md"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational schema, migration, validation, and Master authorization.
3. Complete Phase 3: User Story 1.
4. Validate successful Master organization creation plus invalid, duplicate, and non-Master rejection cases.

### Incremental Delivery

1. Deliver US1 to establish organization creation and tenant boundary.
2. Deliver US2 to make default plan catalog selection visible and verified.
3. Deliver US3 to lock down reusable address and aggregate/reference boundaries.
4. Run Phase 6 quality gates and quickstart validation.

### Team Parallel Strategy

1. One developer handles API domain/application/repository tasks.
2. One developer handles web schemas, requests, and form tasks.
3. One developer handles tests and documentation tasks that target separate files.
4. Integrate through story checkpoints before final polish.

---

## Notes

- Tests are included because this feature changes critical tenant, contract, validation, persistence, and authorization behavior.
- Keep monetary values as integer cents in every task touching plan prices.
- Keep Master behavior separate from organization operators and associated users.
- Do not create `packages/shared` in this feature; keep contracts mirrored from `specs/001-organization-registration/contracts/` until that package exists.

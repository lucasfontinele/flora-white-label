# Tasks: Master Organization Form

**Input**: Design documents from `specs/002-master-organization-form/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Automated tests are included because this feature changes shared API contracts, Master authorization, validation, persistence reads/writes, and critical front-end flows.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested as an independent increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks in the same phase when file paths do not overlap
- **[Story]**: Maps to a user story from [spec.md](./spec.md)
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the shared package shell and workspace wiring needed by all stories.

- [X] T001 Create the shared package manifest with build/typecheck scripts and public exports in `packages/shared/package.json`
- [X] T002 [P] Create the shared package TypeScript configuration with declaration output in `packages/shared/tsconfig.json`
- [X] T003 [P] Create shared source entry files for organization contracts in `packages/shared/src/index.ts` and `packages/shared/src/organizations.ts`
- [X] T004 Add the `@flora/shared` workspace dependency to `packages/api/package.json` and `packages/web/package.json`
- [X] T005 Refresh the workspace lockfile after adding `@flora/shared` in `pnpm-lock.yaml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared contracts, HTTP integration defaults, and API wiring that all user stories depend on.

**Critical**: No user story implementation should start until this phase is complete.

- [X] T006 Implement the shared DTOs and enums from `contracts/shared-types.md` in `packages/shared/src/organizations.ts` and re-export them from `packages/shared/src/index.ts`
- [X] T007 Update API organization and plan domain types to align with shared DTO names in `packages/api/src/domain/organizations/organization.ts` and `packages/api/src/domain/subscription-plans/subscription-plan.ts`
- [X] T008 Update `apiFetch` to use the API base URL, temporary Master headers, JSON handling, and structured error messages in `packages/web/lib/http.ts`
- [X] T009 Update API server route options so tests can inject organization and subscription plan repositories in `packages/api/src/communication/http/build-server.ts`
- [X] T010 Replace duplicated web API contract types with imports or aliases from `@flora/shared` in `packages/web/app/(master)/organizations/types.ts`

**Checkpoint**: Shared contracts and temporary Master integration foundation are ready.

---

## Phase 3: User Story 1 - List Organizations as Master (Priority: P1)

**Goal**: A Master user can open the organization housekeeping screen and inspect a table with relevant organization and plan information.

**Independent Test**: Open `/organizations` with the temporary Master context and verify loading, empty, error, and populated table states; call `GET /organizations?page=1&perPage=20` and verify the response matches the list contract.

### Tests for User Story 1

- [X] T011 [P] [US1] Add route tests for `GET /organizations` success, empty list, pagination, 401, and 403 in `packages/api/src/communication/http/routes/organizations-routes.test.ts`
- [X] T012 [P] [US1] Add repository tests for paginated organization listing and selected plan mapping in `packages/api/src/infrastructure/database/prisma-organization-repository.test.ts`
- [X] T013 [P] [US1] Add request tests for organization list responses and structured errors in `packages/web/app/(master)/organizations/requests/list-organizations.test.ts`
- [X] T014 [P] [US1] Add component tests for table loading, empty, error, and populated states in `packages/web/app/(master)/organizations/components/organization-list-table.test.tsx`

### Implementation for User Story 1

- [X] T015 [US1] Add list input/result types to the organization repository contract in `packages/api/src/application/organizations/organization-repository.ts`
- [X] T016 [US1] Implement the organization list use case with page/perPage normalization in `packages/api/src/application/organizations/list-organizations-use-case.ts`
- [X] T017 [US1] Implement paginated organization listing with address and subscription plan includes in `packages/api/src/infrastructure/database/prisma-organization-repository.ts`
- [X] T018 [US1] Add the `GET /organizations` route and wire `ListOrganizationsUseCase` in `packages/api/src/communication/http/routes/organizations-routes.ts`
- [X] T019 [P] [US1] Create the front-end list request using `ListOrganizationsResponse` in `packages/web/app/(master)/organizations/requests/list-organizations.ts`
- [X] T020 [P] [US1] Create the React Query hook for organization listing in `packages/web/app/(master)/organizations/queries/use-organizations.ts`
- [X] T021 [US1] Create the Master organization table with plan, limits, CNPJ, address summary, and states in `packages/web/app/(master)/organizations/components/organization-list-table.tsx`
- [X] T022 [US1] Create the Master organizations list route with backoffice-style layout and create action in `packages/web/app/(master)/organizations/page.tsx`

**Checkpoint**: User Story 1 is independently functional and is the MVP.

---

## Phase 4: User Story 2 - Register Organization by Steps (Priority: P2)

**Goal**: A Master user can fill company and address data in a multi-step flow with field-level validation and preserved values.

**Independent Test**: Open `/organizations/new`, attempt to advance with invalid company/address data, verify field-level validation, then move forward and backward while values remain present.

### Tests for User Story 2

- [X] T023 [P] [US2] Expand schema tests for company step, address step, optional complement, optional secondary CNAEs, and future foundation date in `packages/web/app/(master)/organizations/schemas/organization-registration-schema.test.ts`
- [X] T024 [P] [US2] Add component tests for multi-step navigation, blocked progression, and value preservation in `packages/web/app/(master)/organizations/components/organization-registration-form.test.tsx`

### Implementation for User Story 2

- [X] T025 [US2] Update the organization registration schema with per-step field groups and shared `CreateOrganizationRequest` typing in `packages/web/app/(master)/organizations/schemas/organization-registration-schema.ts`
- [X] T026 [US2] Refactor the registration form to React Hook Form, Zod validation, step state, and company/address step progression in `packages/web/app/(master)/organizations/components/organization-registration-form.tsx`
- [X] T027 [US2] Update the new organization route with Master housekeeping layout, back-to-list navigation, and form container sizing in `packages/web/app/(master)/organizations/new/page.tsx`

**Checkpoint**: User Story 2 is independently functional at `/organizations/new` through the company and address steps.

---

## Phase 5: User Story 3 - Choose Plan and Confirm Registration (Priority: P3)

**Goal**: A Master user can load available plans, select one plan, review all organization data, submit the organization, and see the created organization reflected in the list.

**Independent Test**: Use `/organizations/new` to select a plan, review the summary, submit valid data, see success with organization name/CNPJ/plan, then return to `/organizations` and verify the new organization appears.

### Tests for User Story 3

- [X] T028 [P] [US3] Add route tests for `GET /subscription-plans` success, 401, and 403 in `packages/api/src/communication/http/routes/subscription-plans-routes.test.ts`
- [X] T029 [P] [US3] Update create route tests for shared response shape, unavailable plan, duplicate CNPJ, and Master headers in `packages/api/src/communication/http/routes/organizations-routes.test.ts`
- [X] T030 [P] [US3] Add request tests for plan lookup and create organization responses in `packages/web/app/(master)/organizations/requests/list-subscription-plans.test.ts` and `packages/web/app/(master)/organizations/requests/create-organization.test.ts`
- [X] T031 [P] [US3] Add component tests for plan loading, plan selection, review summary, successful submit, and failed submit retry in `packages/web/app/(master)/organizations/components/organization-registration-form.test.tsx`

### Implementation for User Story 3

- [X] T032 [US3] Implement the list subscription plans use case in `packages/api/src/application/subscription-plans/list-subscription-plans-use-case.ts`
- [X] T033 [US3] Create the `GET /subscription-plans` route with temporary Master authorization in `packages/api/src/communication/http/routes/subscription-plans-routes.ts`
- [X] T034 [US3] Register subscription plan routes and dependency injection options in `packages/api/src/communication/http/build-server.ts`
- [X] T035 [US3] Update organization creation to return `CreateOrganizationResponse`-compatible data from `packages/api/src/application/organizations/create-organization-use-case.ts` and `packages/api/src/domain/organizations/organization.ts`
- [X] T036 [P] [US3] Create the front-end subscription plan request using `ListSubscriptionPlansResponse` in `packages/web/app/(master)/organizations/requests/list-subscription-plans.ts`
- [X] T037 [P] [US3] Update the create organization request to use `CreateOrganizationRequest` and `CreateOrganizationResponse` in `packages/web/app/(master)/organizations/requests/create-organization.ts`
- [X] T038 [P] [US3] Create the React Query hook for available plans in `packages/web/app/(master)/organizations/queries/use-subscription-plans.ts`
- [X] T039 [US3] Complete plan selection, cent-based price display, review step, submit success, and submit error recovery in `packages/web/app/(master)/organizations/components/organization-registration-form.tsx`
- [X] T040 [US3] Refresh or invalidate the organization list after successful creation using query keys in `packages/web/app/(master)/organizations/queries/use-organizations.ts` and `packages/web/app/(master)/organizations/components/organization-registration-form.tsx`

**Checkpoint**: All three user stories are independently functional and integrated end-to-end.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate contracts, quality gates, and documentation after the functional slices are complete.

- [X] T041 [P] Update implementation notes if endpoint or DTO names changed in `specs/002-master-organization-form/contracts/master-organizations.openapi.yaml` and `specs/002-master-organization-form/contracts/shared-types.md`
- [X] T042 [P] Update the validation guide with final route paths, headers, and expected responses in `specs/002-master-organization-form/quickstart.md`
- [X] T043 Run API tests and fix failures in `packages/api/src/communication/http/routes`, `packages/api/src/application`, and `packages/api/src/infrastructure/database`
- [X] T044 Run web tests and fix failures in `packages/web/app/(master)/organizations` and `packages/web/lib/http.ts`
- [X] T045 Run workspace typecheck and build gates from `package.json`, fixing issues in `packages/shared`, `packages/api`, and `packages/web`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational and is the MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational; can be tested directly at `/organizations/new`.
- **User Story 3 (Phase 5)**: Depends on Foundational and the form shell from User Story 2.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1 - List Organizations as Master**: Start after Foundation; no dependency on US2 or US3.
- **US2 - Register Organization by Steps**: Start after Foundation; no dependency on US1 when tested directly.
- **US3 - Choose Plan and Confirm Registration**: Start after Foundation, but complete after US2 because it extends the same registration form.

### Within Each User Story

- Write tests first and confirm they fail before implementation.
- Shared contracts must exist before API and web imports are changed.
- API use cases and repositories must exist before route wiring.
- Routes must satisfy contracts before web requests depend on them.
- Web requests and queries must exist before screen components consume them.

## Parallel Opportunities

- T002 and T003 can run in parallel with T001 if files are created independently.
- T011, T012, T013, and T014 can be written in parallel for US1.
- T019 and T020 can run in parallel after the list response contract exists.
- T023 and T024 can run in parallel for US2.
- T028, T029, T030, and T031 can be written in parallel for US3.
- T036, T037, and T038 can run in parallel after shared contracts are available.
- T041 and T042 can run in parallel during polish.

## Parallel Example: User Story 1

```text
Task: "T011 Add route tests for GET /organizations in packages/api/src/communication/http/routes/organizations-routes.test.ts"
Task: "T012 Add repository tests for paginated organization listing in packages/api/src/infrastructure/database/prisma-organization-repository.test.ts"
Task: "T013 Add request tests in packages/web/app/(master)/organizations/requests/list-organizations.test.ts"
Task: "T014 Add table component tests in packages/web/app/(master)/organizations/components/organization-list-table.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "T023 Expand schema tests in packages/web/app/(master)/organizations/schemas/organization-registration-schema.test.ts"
Task: "T024 Add component tests in packages/web/app/(master)/organizations/components/organization-registration-form.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T028 Add subscription plan route tests in packages/api/src/communication/http/routes/subscription-plans-routes.test.ts"
Task: "T030 Add request tests in packages/web/app/(master)/organizations/requests/list-subscription-plans.test.ts and packages/web/app/(master)/organizations/requests/create-organization.test.ts"
Task: "T036 Create plan request in packages/web/app/(master)/organizations/requests/list-subscription-plans.ts"
Task: "T038 Create plan query hook in packages/web/app/(master)/organizations/queries/use-subscription-plans.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for list API, list request/query, and table UI.
3. Validate `GET /organizations` and `/organizations` independently.
4. Stop and demo the Master organization list before adding registration behavior.

### Incremental Delivery

1. Foundation: shared package, DTO imports, temporary Master HTTP headers.
2. US1: organization list endpoint and table.
3. US2: multi-step company/address form validation.
4. US3: plan lookup, review, create submission, and list refresh.
5. Polish: docs, quickstart, tests, typecheck, and build.

### Validation Gates

1. `pnpm test:api`
2. `pnpm test:web`
3. `pnpm typecheck`
4. `pnpm build`

## Notes

- Keep `packages/shared` free from React, Next.js, Fastify, Prisma, and database code.
- Keep temporary Master headers localized to HTTP/client integration so final authentication can replace them later.
- Keep monetary values as integer cents in shared contracts, API responses, and front-end state.
- Do not implement edit, delete, suspension, billing, or analytics in this feature.

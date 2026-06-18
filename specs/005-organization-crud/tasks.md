# Tasks: CRUD de Organizações Master

**Input**: Design documents from `/specs/005-organization-crud/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/organizations.openapi.yaml](./contracts/organizations.openapi.yaml), [quickstart.md](./quickstart.md)

**Tests**: Automated tests are required because this feature changes API contracts, validation, persistence, and tenant-root registration behavior. HTTP integration tests are conditional on finding or introducing a clean Fastify `inject` pattern without a production database dependency.

**Organization**: Tasks are grouped by user story while keeping shared domain, repository, Prisma, and presentation foundations before story work.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its dependencies are complete.
- **[Story]**: Maps to user stories from `spec.md`.
- Every task includes files, objective, dependencies, acceptance criteria, and tests.

## Phase 1: Setup & Contract Review

**Purpose**: Confirm feature docs and existing API structure before code changes.

- [x] T001 Review API contract in `specs/005-organization-crud/contracts/organizations.openapi.yaml` | Objective: confirm create/list/get/update/delete payloads and errors match `spec.md` | Dependencies: none | Acceptance: contract covers all five `/backoffice/organizations` endpoints and omits 403 | Tests: YAML parse or OpenAPI lint if available
- [x] T002 [P] Review current Prisma models in `packages/api/prisma/schema.prisma` | Objective: verify `Organization`, `Address`, and `SubscriptionPlan` already model required fields/relations | Dependencies: none | Acceptance: document whether a schema/migration change is required before implementation | Tests: no automated test, inspection only
- [x] T003 [P] Review current Fastify registration in `packages/api/src/shared/presentation/http/fastify/app.ts` | Objective: identify exact route registration point for organization routes | Dependencies: none | Acceptance: route plugin can be registered after existing global plugins without auth middleware | Tests: no automated test, inspection only

---

## Phase 2: Foundational Domain, Repositories, and Shared Infrastructure

**Purpose**: Blocking prerequisites used by all user stories.

**Critical**: Complete this phase before implementing story-specific use cases/routes.

### Domain

- [x] T004 [P] Review/reuse `Cnpj` in `packages/api/src/modules/organizations/domain/value-objects/Cnpj.ts` | Objective: ensure masked/unmasked input normalizes to 14 digits and validates check digits | Dependencies: T001 | Acceptance: no duplicate CNPJ value object is created and any gaps are documented as tests | Tests: covered by T021
- [x] T005 [P] Review/reuse `Cnae` in `packages/api/src/modules/organizations/domain/value-objects/Cnae.ts` | Objective: ensure masked/unmasked input normalizes to exactly 7 digits without official-table lookup | Dependencies: T001 | Acceptance: no duplicate CNAE value object is created and behavior matches spec | Tests: covered by T022
- [x] T006 Adjust `Address` entity in `packages/api/src/modules/addresses/domain/entities/Address.ts` | Objective: enforce persistable Entity rules, optional `title`/`complement`, UF normalization, and exact 8-digit CEP if missing | Dependencies: T002 | Acceptance: `Address.create` rejects invalid CEP/UF and never persists blank optional strings | Tests: covered by T023
- [x] T007 Adjust `Organization` aggregate root in `packages/api/src/modules/organizations/domain/entities/Organization.ts` | Objective: preserve Aggregate Root behavior and add only narrow helpers/invariants needed for full update | Dependencies: T004, T005 | Acceptance: `Organization` remains an `AggregateRoot`, validates required names/currentPlanId/addressId, and does not own patient/user/settings data | Tests: covered by T024
- [x] T008 Decide Prisma schema/migration action in `packages/api/prisma/schema.prisma` and `packages/api/prisma/migrations/` | Objective: change schema only if delete behavior or migration drift requires it | Dependencies: T002, T006, T007 | Acceptance: either no migration is needed and this is recorded, or a narrow migration is planned for required schema change | Tests: `pnpm prisma:generate` in T047 if schema/client types change

### Application Repository Ports

- [x] T009 Expand `AddressRepository` in `packages/api/src/modules/addresses/application/repositories/AddressRepository.ts` | Objective: add update/delete responsibilities needed by organization update/delete while keeping `Address` non-aggregate | Dependencies: T006 | Acceptance: repository port supports `create`, `save`, and `delete` or an equivalent explicit address cleanup method | Tests: exercised by use case tests T025, T037, T041
- [x] T010 Expand `OrganizationRepository` in `packages/api/src/modules/organizations/application/repositories/OrganizationRepository.ts` | Objective: add read models, `findById`, details/list reads, save, delete, and duplicate-CNPJ-excluding-current-ID checks | Dependencies: T007 | Acceptance: application can express create/list/get/update/delete without Prisma types | Tests: exercised by use case tests T025, T031, T032, T037, T041
- [x] T011 Review/reuse `SubscriptionPlanRepository` in `packages/api/src/modules/subscription-plans/application/repositories/SubscriptionPlanRepository.ts` | Objective: reuse existing `findById` and read data for current-plan summary without recreating plan behavior | Dependencies: T001 | Acceptance: no new subscription plan entity/repository is created for this feature | Tests: exercised by use case tests T025 and T037

### Infrastructure Foundations

- [x] T012 Adjust `AddressMapper` in `packages/api/src/modules/addresses/infrastructure/prisma/AddressMapper.ts` | Objective: support create/update persistence mapping for normalized address fields | Dependencies: T006, T009 | Acceptance: mapper converts Prisma records to `Address` and emits persistence data without blank optional strings | Tests: indirectly covered by repository/use case tests T025, T037, T041
- [x] T013 Adjust `OrganizationMapper` in `packages/api/src/modules/organizations/infrastructure/prisma/OrganizationMapper.ts` | Objective: support domain mapping, create/update persistence mapping, and read-model conversion needs | Dependencies: T007, T010, T011 | Acceptance: mapper preserves normalized CNPJ/CNAE values and does not expose Prisma types outside infrastructure | Tests: indirectly covered by use case tests T025, T031, T032, T037, T041
- [x] T014 Adjust `PrismaAddressRepository` in `packages/api/src/modules/addresses/infrastructure/prisma/PrismaAddressRepository.ts` | Objective: implement address save/delete methods using `TransactionalPrisma` | Dependencies: T009, T012 | Acceptance: address writes participate in the active unit of work | Tests: indirectly covered by use case tests T037 and T041
- [x] T015 Adjust `PrismaOrganizationRepository` in `packages/api/src/modules/organizations/infrastructure/prisma/PrismaOrganizationRepository.ts` | Objective: implement organization CRUD, nested address/currentPlan reads, and duplicate CNPJ checks | Dependencies: T010, T013, T014 | Acceptance: repository returns `OrganizationReadModel` for details/list without leaking Prisma types | Tests: indirectly covered by use case tests T025, T031, T032, T037, T041
- [x] T016 Create organization use-case factory in `packages/api/src/modules/organizations/infrastructure/create-organization-use-cases.factory.ts` | Objective: wire organization, address, subscription plan repositories, and `PrismaTransactionManager` for all CRUD use cases | Dependencies: T009, T010, T011, T014, T015 | Acceptance: factory exposes create/list/get/update/delete use cases and replaces or supersedes single-use-case factory safely | Tests: route tests T043 if added, otherwise typecheck T047

**Checkpoint**: Domain, repository ports, mappers, and Prisma repositories are ready for story implementation.

---

## Phase 3: User Story 1 - Cadastrar Organização com Endereço (Priority: P1) MVP

**Goal**: Create an organization with address and existing current plan in one logical operation.

**Independent Test**: Send a valid `POST /backoffice/organizations` payload and confirm response includes normalized organization data, nested address, and current plan summary; invalid plan/CNPJ/address data does not partially persist.

### Implementation for User Story 1

- [x] T017 [US1] Adjust `CreateOrganizationUseCase` in `packages/api/src/modules/organizations/application/use-cases/CreateOrganizationUseCase.ts` | Objective: accept API-shaped `currentPlanId`, create address and organization atomically, and return full `OrganizationReadModel` | Dependencies: T009-T016 | Acceptance: valid input returns organization response data; missing plan throws `NotFoundError`; duplicate CNPJ throws `ConflictError`; no partial writes | Tests: T025
- [x] T018 [US1] Create organization presenter in `packages/api/src/modules/organizations/presentation/http/organization-presenter.ts` | Objective: convert `OrganizationReadModel` to API response with ISO timestamps and normalized nested values | Dependencies: T017 | Acceptance: presenter output matches `OrganizationResponse` in OpenAPI contract | Tests: covered by schema/route tests T026 and T045
- [x] T019 [US1] Create create-body Zod schema in `packages/api/src/modules/organizations/presentation/http/organization-schemas.ts` | Objective: validate strict create payload with `organization` and `address` objects before use case execution | Dependencies: T001, T017 | Acceptance: schema accepts masked valid CNPJ/CNAE/CEP and rejects missing objects, blank required fields, invalid UF, extra fields, and partial body | Tests: T026
- [x] T020 [US1] Create POST handler in `packages/api/src/modules/organizations/presentation/http/organization-routes.ts` | Objective: implement `POST /backoffice/organizations` using Zod `safeParse`, create use case, presenter, and 201 response | Dependencies: T016, T018, T019 | Acceptance: route has no auth middleware, no address sub-route, and returns structured 400 validation errors | Tests: T043 if HTTP pattern exists, otherwise manual quickstart scenario

### Tests for User Story 1

- [x] T021 [P] [US1] Add CNPJ unit tests in `packages/api/src/modules/organizations/domain/value-objects/Cnpj.test.ts` | Objective: verify reuse behavior for masked/unmasked valid CNPJ, invalid length, repeated digits, and invalid check digits | Dependencies: T004 | Acceptance: tests prove normalized 14-digit storage and expected domain validation failures | Tests: run with `pnpm test:api`
- [x] T022 [P] [US1] Add CNAE unit tests in `packages/api/src/modules/organizations/domain/value-objects/Cnae.test.ts` | Objective: verify reuse behavior for `8630-5/03`, `8630503`, invalid length, blank input, and no official lookup | Dependencies: T005 | Acceptance: tests prove normalized 7-digit storage and structural-only validation | Tests: run with `pnpm test:api`
- [x] T023 [P] [US1] Add Address unit tests in `packages/api/src/modules/addresses/domain/entities/Address.test.ts` | Objective: verify Entity behavior, exact 8-digit CEP normalization, UF validation, required fields, and optional blank-to-null handling | Dependencies: T006 | Acceptance: tests fail before fix if CEP length is not enforced and pass after domain adjustment | Tests: run with `pnpm test:api`
- [x] T024 [P] [US1] Add Organization unit tests in `packages/api/src/modules/organizations/domain/entities/Organization.test.ts` | Objective: verify Aggregate Root behavior, required names, required currentPlanId/addressId, and normalized value-object usage | Dependencies: T007 | Acceptance: tests assert `Organization` remains aggregate root and rejects invalid invariants | Tests: run with `pnpm test:api`
- [x] T025 [US1] Update create use-case tests in `packages/api/src/modules/organizations/application/use-cases/CreateOrganizationUseCase.test.ts` | Objective: cover atomic create, normalized response, plan not found, duplicate CNPJ, invalid address, and no partial writes | Dependencies: T017 | Acceptance: test doubles prove address and organization repositories are called inside unit of work only for valid input | Tests: run with `pnpm test:api`
- [x] T026 [P] [US1] Add create schema tests in `packages/api/src/modules/organizations/presentation/http/organization-schemas.test.ts` | Objective: cover create payload validation for body shape, strict fields, optional fields, masks, and invalid UF/CEP/CNPJ/CNAE inputs | Dependencies: T019 | Acceptance: schema tests cover success and expected 400-level invalid payloads | Tests: run with `pnpm test:api`

**Checkpoint**: US1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Consultar Organizações (Priority: P2)

**Goal**: List organizations and get one organization by ID with address and current plan summary.

**Independent Test**: Create organizations, call list and get endpoints, confirm nested address/currentPlan shape; unknown ID returns 404.

### Implementation for User Story 2

- [x] T027 [P] [US2] Create `ListOrganizationsUseCase` in `packages/api/src/modules/organizations/application/use-cases/ListOrganizationsUseCase.ts` | Objective: return `{ data }` with `OrganizationReadModel[]` from repository | Dependencies: T010, T015 | Acceptance: empty repository returns empty list and populated repository returns nested read models | Tests: T031
- [x] T028 [P] [US2] Create `GetOrganizationByIdUseCase` in `packages/api/src/modules/organizations/application/use-cases/GetOrganizationByIdUseCase.ts` | Objective: return one `OrganizationReadModel` or throw `NotFoundError` | Dependencies: T010, T015 | Acceptance: existing ID returns details; missing ID maps to not found | Tests: T032
- [x] T029 [US2] Add params/query Zod schemas in `packages/api/src/modules/organizations/presentation/http/organization-schemas.ts` | Objective: validate nonblank route `id` and keep list query empty/no filters for v1 | Dependencies: T019, T027, T028 | Acceptance: params schema rejects blank IDs; list endpoint does not accept required filters | Tests: T033 and T042
- [x] T030 [US2] Add GET handlers/routes in `packages/api/src/modules/organizations/presentation/http/organization-routes.ts` | Objective: implement `GET /backoffice/organizations` and `GET /backoffice/organizations/:id` with presenter and structured errors | Dependencies: T018, T027, T028, T029 | Acceptance: list returns `{ data: [] }` when empty; get returns 404 via global error handler when missing | Tests: T043 if HTTP pattern exists, otherwise manual quickstart scenarios

### Tests for User Story 2

- [x] T031 [P] [US2] Add list use-case tests in `packages/api/src/modules/organizations/application/use-cases/ListOrganizationsUseCase.test.ts` | Objective: verify empty and populated list outputs with address/currentPlan summaries | Dependencies: T027 | Acceptance: tests cover response shape independent of HTTP | Tests: run with `pnpm test:api`
- [x] T032 [P] [US2] Add get-by-ID use-case tests in `packages/api/src/modules/organizations/application/use-cases/GetOrganizationByIdUseCase.test.ts` | Objective: verify found and not-found behavior | Dependencies: T028 | Acceptance: missing ID throws `NotFoundError`; found ID returns full read model | Tests: run with `pnpm test:api`
- [x] T033 [P] [US2] Extend schema tests in `packages/api/src/modules/organizations/presentation/http/organization-schemas.test.ts` | Objective: verify params/query validation for get/list endpoints | Dependencies: T029 | Acceptance: blank `id` fails and list query requirements remain empty | Tests: run with `pnpm test:api`

**Checkpoint**: US2 is independently functional after foundation, and can be validated with created fixtures.

---

## Phase 5: User Story 3 - Atualizar Organização e Endereço (Priority: P3)

**Goal**: Fully replace organization and address data in one endpoint while preserving previous data on failure.

**Independent Test**: Create an organization, call `PUT /backoffice/organizations/:id` with a complete valid payload, then get it and confirm updated organization/address/currentPlan; invalid payloads leave prior data unchanged.

### Implementation for User Story 3

- [x] T034 [US3] Create `UpdateOrganizationUseCase` in `packages/api/src/modules/organizations/application/use-cases/UpdateOrganizationUseCase.ts` | Objective: validate existing organization, existing current plan, duplicate CNPJ excluding current ID, full replacement, address save, and atomic rollback | Dependencies: T009-T017, T027, T028 | Acceptance: valid update returns full read model; missing organization/plan and duplicate CNPJ fail without data changes | Tests: T037
- [x] T035 [US3] Add update-body Zod schema in `packages/api/src/modules/organizations/presentation/http/organization-schemas.ts` | Objective: require full `PUT` body using same write shape as create, with all required organization/address fields | Dependencies: T019, T029, T034 | Acceptance: partial update fails; complete valid body passes; optional `title`/`complement` may be null | Tests: T038
- [x] T036 [US3] Add PUT handler/route in `packages/api/src/modules/organizations/presentation/http/organization-routes.ts` | Objective: implement `PUT /backoffice/organizations/:id` with params/body validation, update use case, and presenter | Dependencies: T018, T034, T035 | Acceptance: route performs no auth check, returns 200 on success, 400 on invalid payload, 404/409 via global handler | Tests: T043 if HTTP pattern exists, otherwise manual quickstart scenario

### Tests for User Story 3

- [x] T037 [US3] Add update use-case tests in `packages/api/src/modules/organizations/application/use-cases/UpdateOrganizationUseCase.test.ts` | Objective: cover valid full update, missing organization, missing plan, duplicate CNPJ, invalid address, and rollback/no prior-data mutation | Dependencies: T034 | Acceptance: tests prove organization and address are saved only for valid complete updates | Tests: run with `pnpm test:api`
- [x] T038 [P] [US3] Extend schema tests in `packages/api/src/modules/organizations/presentation/http/organization-schemas.test.ts` | Objective: cover `PUT` full replacement validation and reject partial updates | Dependencies: T035 | Acceptance: schema tests fail partial update bodies and accept complete normalized inputs | Tests: run with `pnpm test:api`

**Checkpoint**: US3 can be validated independently by creating a fixture and updating it.

---

## Phase 6: User Story 4 - Remover Organização (Priority: P4)

**Goal**: Remove an organization and prevent its associated address from remaining available as an orphan in this resource.

**Independent Test**: Create an organization, call `DELETE /backoffice/organizations/:id`, then verify get/list no longer returns it; unknown ID returns 404.

### Implementation for User Story 4

- [x] T039 [US4] Create `DeleteOrganizationUseCase` in `packages/api/src/modules/organizations/application/use-cases/DeleteOrganizationUseCase.ts` | Objective: find organization, delete organization and associated address cleanup in one unit of work, and throw `NotFoundError` when missing | Dependencies: T009, T010, T014, T015 | Acceptance: deleted organization disappears from details/list and address cleanup is called according to repository contract | Tests: T041
- [x] T040 [US4] Add DELETE handler/route in `packages/api/src/modules/organizations/presentation/http/organization-routes.ts` | Objective: implement `DELETE /backoffice/organizations/:id` with params validation and 204 response | Dependencies: T029, T039 | Acceptance: success returns 204 without body; missing organization returns 404; no auth middleware is added | Tests: T043 if HTTP pattern exists, otherwise manual quickstart scenario

### Tests for User Story 4

- [x] T041 [US4] Add delete use-case tests in `packages/api/src/modules/organizations/application/use-cases/DeleteOrganizationUseCase.test.ts` | Objective: cover successful delete, missing organization, unit-of-work use, and address cleanup behavior | Dependencies: T039 | Acceptance: tests prove repository delete methods are called only after existing organization lookup succeeds | Tests: run with `pnpm test:api`
- [x] T042 [P] [US4] Extend params schema tests in `packages/api/src/modules/organizations/presentation/http/organization-schemas.test.ts` | Objective: ensure DELETE route params reject blank IDs | Dependencies: T029 | Acceptance: invalid params fail before use case execution | Tests: run with `pnpm test:api`

**Checkpoint**: US4 completes the CRUD cycle without adding address endpoints.

---

## Phase 7: Presentation Integration & Route Registration

**Purpose**: Wire all implemented story endpoints into the Fastify application.

- [x] T043 Register all organization routes in `packages/api/src/modules/organizations/presentation/http/organization-routes.ts` | Objective: ensure one route plugin contains POST, GET list, GET by ID, PUT, and DELETE handlers | Dependencies: T020, T030, T036, T040 | Acceptance: the route file exposes a Fastify plugin for `/backoffice/organizations` only | Tests: route tests T045 if pattern exists, otherwise typecheck T047
- [x] T044 Register route plugin in `packages/api/src/shared/presentation/http/fastify/app.ts` | Objective: add `organizationRoutes` to app registration after global plugins and before Swagger UI | Dependencies: T043 | Acceptance: API app includes organization CRUD routes and no authorization middleware is introduced | Tests: typecheck T047 and build T050
- [x] T045 [P] Create HTTP integration tests only if a clean pattern exists in `packages/api/src/modules/organizations/presentation/http/organization-routes.test.ts` | Objective: verify create/list/get/update/delete HTTP behavior with Fastify `inject` or established project pattern | Dependencies: T043, T044 | Acceptance: tests cover status codes 201/200/204/400/404/409 without requiring a production database; if no pattern exists, document manual validation in task notes | Tests: run with `pnpm test:api`
  - Note: no existing Fastify `inject`/route integration test pattern was found under `packages/api`; HTTP scenarios remain covered by unit/schema tests plus quickstart validation to avoid adding a database-dependent test harness in this slice.

---

## Phase 8: Final Validation & Cross-Cutting Checks

**Purpose**: Validate the whole slice and keep delivery within scope.

- [x] T046 Run Prisma client generation with `pnpm prisma:generate` | Objective: refresh generated Prisma types if schema or relation use requires it | Dependencies: T008, T015 | Acceptance: command succeeds or no-op is documented if schema unchanged | Tests: generated client compiles in T047
- [x] T047 Run API typecheck with `pnpm typecheck:api` | Objective: validate TypeScript boundaries for domain/application/infrastructure/presentation | Dependencies: T044, T046 | Acceptance: command exits successfully | Tests: command output
- [x] T048 Run API lint with `pnpm --filter @flora/api lint` | Objective: verify code style and import/layer hygiene for touched API files | Dependencies: T044 | Acceptance: command exits successfully or existing unrelated lint issues are documented | Tests: command output
- [x] T049 Run API tests with `pnpm test:api` | Objective: execute value-object, domain, use-case, schema, and optional route tests | Dependencies: T021-T026, T031-T033, T037-T038, T041-T042, T045 | Acceptance: command exits successfully with organization CRUD tests included | Tests: command output
- [x] T050 Run API build with `pnpm build:api` | Objective: verify production build for API-only changes | Dependencies: T047, T049 | Acceptance: command exits successfully | Tests: command output
- [ ] T051 Run quickstart manual scenarios in `specs/005-organization-crud/quickstart.md` | Objective: validate create/list/get/update/delete behavior end-to-end against a local API and existing plan | Dependencies: T044, T046-T050 | Acceptance: quickstart scenarios produce expected 201/200/204/400-or-422/404/409 responses | Tests: manual API validation notes
  - Note: not executed in this pass because it requires a running local API, PostgreSQL, and an existing `SubscriptionPlan` ID.
- [x] T052 Confirm scope boundaries in `packages/web/app/(master)/organizations/components/organization-registration-form.tsx` and related web files | Objective: verify no frontend changes were made for this API-only feature | Dependencies: T001-T051 | Acceptance: frontend files remain untouched unless separately requested | Tests: `git diff -- packages/web` inspection

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: no dependencies.
- **Phase 2 Foundational**: depends on Phase 1; blocks user stories.
- **US1 Create (Phase 3)**: depends on Foundational; MVP scope.
- **US2 Consult (Phase 4)**: depends on Foundational and benefits from US1 fixture creation, but use cases/routes are independently testable with repository fixtures.
- **US3 Update (Phase 5)**: depends on Foundational and needs an existing organization fixture.
- **US4 Delete (Phase 6)**: depends on Foundational and needs an existing organization fixture.
- **Presentation Integration (Phase 7)**: depends on story route handlers.
- **Final Validation (Phase 8)**: depends on desired stories and integration being complete.

### User Story Dependencies

- **US1 (P1)**: start after Phase 2; suggested MVP.
- **US2 (P2)**: start after Phase 2; can be implemented in parallel with US1 at use-case level, but manual validation is easier after US1.
- **US3 (P3)**: start after Phase 2; practical validation needs a created organization fixture.
- **US4 (P4)**: start after Phase 2; practical validation needs a created organization fixture.

### Parallel Opportunities

- T002 and T003 can run in parallel with T001.
- T004 and T005 can run in parallel after T001.
- T012 and T013 can run in parallel after their domain/repository prerequisites.
- T021, T022, T023, and T024 can run in parallel after foundational domain work.
- T027 and T028 can run in parallel after repository read model support.
- T031, T032, and T033 can run in parallel after their corresponding US2 implementation tasks.
- T037 and T038 can run in parallel after update use case/schema are available.
- T041 and T042 can run in parallel after delete use case/params schema are available.
- T045 can run in parallel with final validation preparation once routes are registered.

---

## Parallel Example: User Story 1

```text
Task: "T021 Add CNPJ unit tests in packages/api/src/modules/organizations/domain/value-objects/Cnpj.test.ts"
Task: "T022 Add CNAE unit tests in packages/api/src/modules/organizations/domain/value-objects/Cnae.test.ts"
Task: "T023 Add Address unit tests in packages/api/src/modules/addresses/domain/entities/Address.test.ts"
Task: "T024 Add Organization unit tests in packages/api/src/modules/organizations/domain/entities/Organization.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "T027 Create ListOrganizationsUseCase in packages/api/src/modules/organizations/application/use-cases/ListOrganizationsUseCase.ts"
Task: "T028 Create GetOrganizationByIdUseCase in packages/api/src/modules/organizations/application/use-cases/GetOrganizationByIdUseCase.ts"
```

## Parallel Example: User Story 3

```text
Task: "T037 Add update use-case tests in packages/api/src/modules/organizations/application/use-cases/UpdateOrganizationUseCase.test.ts"
Task: "T038 Extend schema tests in packages/api/src/modules/organizations/presentation/http/organization-schemas.test.ts"
```

## Parallel Example: User Story 4

```text
Task: "T041 Add delete use-case tests in packages/api/src/modules/organizations/application/use-cases/DeleteOrganizationUseCase.test.ts"
Task: "T042 Extend params schema tests in packages/api/src/modules/organizations/presentation/http/organization-schemas.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for create organization with address.
3. Complete route registration tasks T043 and T044 for the POST route surface.
4. Run T046-T050 for API gates.
5. Validate quickstart create/error scenarios manually.

### Incremental Delivery

1. Foundation: domain, repository ports, mappers, Prisma repositories, and factory.
2. US1: create organization with address and current plan.
3. US2: list/get organization with nested address and current plan.
4. US3: full update of organization and address.
5. US4: delete organization with address cleanup.
6. Final validation and quickstart.

### Scope Guardrails

- Do not add frontend tasks or modify `packages/web`.
- Do not add authorization middleware, Master profile validation, login, or mandatory 403 handling.
- Do not add standalone address endpoints.
- Do not add billing, payment gateway, plan history, logo upload, or plan seed unless an existing test fixture requires it.

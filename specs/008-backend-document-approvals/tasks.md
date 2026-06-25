# Tasks: Backend de Documentos Obrigatórios e Aprovações

**Input**: Design documents from `/specs/008-backend-document-approvals/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/organization-documents.openapi.yaml](./contracts/organization-documents.openapi.yaml)

**Tests**: Automated tests are required because this feature changes API contracts, tenant isolation, validation, persistence, documents, and audit logs.

**Organization**: Tasks are grouped by setup/foundation and then by user story. Required Documents is US1. Patient Document Approvals creation/listing is US2. Approval transitions and logs are US3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after dependencies are met because it touches different files or has no dependency on incomplete tasks.
- **[Story]**: Maps task to the user story from `spec.md`.
- Every task includes file path, objective, dependencies, and acceptance criteria.

## Phase 1: Setup (Shared Structure)

**Purpose**: Create the module skeleton and shared file layout without implementing behavior.

- [X] T001 Create organization documents module directories in `packages/api/src/modules/organization-documents/{domain/entities,domain/enums,application/repositories,application/use-cases,infrastructure/prisma,presentation/http}`; objective: establish planned backend-only structure; dependencies: none; acceptance: all directories exist and no frontend path is created.
- [X] T002 [P] Create empty barrel-free placeholder files only where needed for future imports in `packages/api/src/modules/organization-documents/`; objective: avoid missing-directory churn during implementation; dependencies: T001; acceptance: placeholders contain no runtime logic and can be deleted/replaced by later tasks.

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: Shared persistence, enums, and error decisions required before either story can be completed.

**Critical**: No user story should be implemented before this phase is complete.

- [X] T003 Create `DocumentApprovalStatus` enum in `packages/api/src/modules/organization-documents/domain/enums/DocumentApprovalStatus.ts`; objective: expose `Pending = "PENDING"`, `Rejected = "REJECTED"`, and `Approved = "APPROVED"`; dependencies: T001; acceptance: enum values match the spec exactly.
- [X] T004 [P] Create `DocumentApprovalAction` enum in `packages/api/src/modules/organization-documents/domain/enums/DocumentApprovalAction.ts`; objective: expose `CREATED_PATIENT_DOCUMENT_APPROVAL`, `APPROVED_DOCUMENT`, `REJECTED_DOCUMENT`, and `RESET_DOCUMENT_TO_PENDING`; dependencies: T001; acceptance: enum persists string-compatible values exactly as specified.
- [X] T005 Update Prisma models and enum in `packages/api/prisma/schema.prisma`; objective: add `OrganizationRequiredDocument`, `OrganizationDocumentPatientApproval`, `OrganizationDocumentApprovalLog`, `DocumentApprovalStatus`, and relations to `Organization` and `Patient`; dependencies: T003; acceptance: schema contains unique constraints `@@unique([organizationId, name])` and `@@unique([documentId, patientId])`, with no file/upload/storage fields.
- [X] T006 Create migration SQL in `packages/api/prisma/migrations/<timestamp>_organization_document_approvals/migration.sql`; objective: persist required documents, approvals, logs, and status enum; dependencies: T005; acceptance: migration maps tables to `organization_required_documents`, `organization_document_patient_approvals`, and `organization_document_approval_logs`.
- [X] T007 Run or prepare Prisma client generation for `packages/api/prisma/schema.prisma`; objective: make new Prisma types available; dependencies: T005 and T006; acceptance: `pnpm prisma:generate` can complete without schema errors.
- [X] T008 Review existing application/domain errors in `packages/api/src/shared/application/errors` and `packages/api/src/shared/domain/errors`; objective: decide whether `ConflictError`, `NotFoundError`, and `DomainValidationError` cover this feature; dependencies: none; acceptance: no new error class is added unless a concrete missing semantic is documented in `packages/api/src/modules/organization-documents/application/use-cases`.
- [X] T009 Extend `PatientRepository` in `packages/api/src/modules/patients/application/repositories/PatientRepository.ts`; objective: add `findByIdInOrganization(organizationId, patientId)` for tenant validation; dependencies: none; acceptance: interface supports scoped patient lookup without exposing Prisma.
- [X] T010 Implement scoped patient lookup in `packages/api/src/modules/patients/infrastructure/prisma/PrismaPatientRepository.ts`; objective: support approval creation/listing tenant checks; dependencies: T009; acceptance: method queries by both `id` and `organizationId` and maps through `PatientMapper`.

**Checkpoint**: Foundation ready; Required Documents and Patient Document Approvals tasks can proceed.

---

## Phase 3: User Story 1 - Configurar Documentos Exigidos (Priority: P1) MVP

**Goal**: Allow an organization to create, list, update, and delete required document configurations with name uniqueness per organization.

**Independent Test**: Create, list, update, and delete required documents for one organization; verify duplicate names fail in the same organization and same names can exist in different organizations.

### Tests for User Story 1

- [X] T011 [P] [US1] Add domain tests for required document validation in `packages/api/src/modules/organization-documents/domain/entities/OrganizationRequiredDocument.test.ts`; objective: cover required `organizationId`, trimmed `name`, and no file semantics; dependencies: T001; acceptance: tests fail before entity exists and pass after T017.
- [X] T012 [P] [US1] Add create required-document use-case tests in `packages/api/src/modules/organization-documents/application/use-cases/CreateOrganizationRequiredDocumentUseCase.test.ts`; objective: cover create success, same-organization duplicate conflict, different-organization same-name allowance, and organization not found; dependencies: T008; acceptance: create-specific tests use in-memory fakes and do not cover list, update, or delete behavior.
- [X] T013 [P] [US1] Add list required-document use-case tests in `packages/api/src/modules/organization-documents/application/use-cases/ListOrganizationRequiredDocumentsUseCase.test.ts`; objective: cover listing only documents for the requested organization; dependencies: T008; acceptance: list-specific tests do not cover create, update, or delete behavior.
- [X] T014 [P] [US1] Add update required-document use-case tests in `packages/api/src/modules/organization-documents/application/use-cases/UpdateOrganizationRequiredDocumentUseCase.test.ts`; objective: cover update success, document not found, same-organization duplicate target name, and tenant scope; dependencies: T008; acceptance: update-specific tests do not cover create, list, or delete behavior.
- [X] T015 [P] [US1] Add delete-specific use-case tests in `packages/api/src/modules/organization-documents/application/use-cases/DeleteOrganizationRequiredDocumentUseCase.test.ts`; objective: cover delete success, document not found, and delete blocked when approvals exist; dependencies: T008; acceptance: delete-specific tests assert `ConflictError` for in-use document and do not cover create, list, or update behavior.
- [X] T016 [P] [US1] Add Zod schema tests in `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.test.ts`; objective: cover required-document params/body validation and whitespace-only names; dependencies: T001; acceptance: presentation schema tests do not cover application use-case behavior.

### Implementation for User Story 1 - Parte A Required Documents

- [X] T017 [US1] Create `OrganizationRequiredDocument` entity in `packages/api/src/modules/organization-documents/domain/entities/OrganizationRequiredDocument.ts`; objective: enforce non-empty `organizationId` and trimmed non-empty `name`; dependencies: T011; acceptance: entity extends shared `Entity`, has getters, and tests in T011 pass.
- [X] T018 [US1] Create `OrganizationRequiredDocumentRepository` interface in `packages/api/src/modules/organization-documents/application/repositories/OrganizationRequiredDocumentRepository.ts`; objective: define read model and methods for find-by-id-in-organization, duplicate checks, list, create, save, delete, and `hasApprovals`; dependencies: T017; acceptance: interface contains all operations from `data-model.md`.
- [X] T019 [US1] Create Prisma mapper in `packages/api/src/modules/organization-documents/infrastructure/prisma/OrganizationRequiredDocumentMapper.ts`; objective: convert between Prisma records, domain entity, persistence inputs, and required-document read model; dependencies: T005 and T017; acceptance: mapper does not leak Prisma types outside infrastructure.
- [X] T020 [US1] Create Prisma repository in `packages/api/src/modules/organization-documents/infrastructure/prisma/PrismaOrganizationRequiredDocumentRepository.ts`; objective: implement `OrganizationRequiredDocumentRepository`; dependencies: T018 and T019; acceptance: repository filters by `organizationId`, orders list by `createdAt`, and counts approvals for `hasApprovals`.
- [X] T021 [US1] Create `CreateOrganizationRequiredDocumentUseCase` in `packages/api/src/modules/organization-documents/application/use-cases/CreateOrganizationRequiredDocumentUseCase.ts`; objective: validate organization existence, prevent duplicate name in same organization, create document, and return read model; dependencies: T018 and T020; acceptance: T012 create and duplicate tests pass.
- [X] T022 [US1] Create `ListOrganizationRequiredDocumentsUseCase` in `packages/api/src/modules/organization-documents/application/use-cases/ListOrganizationRequiredDocumentsUseCase.ts`; objective: list only required documents for the route organization; dependencies: T018; acceptance: T013 list tests pass.
- [X] T023 [US1] Create `UpdateOrganizationRequiredDocumentUseCase` in `packages/api/src/modules/organization-documents/application/use-cases/UpdateOrganizationRequiredDocumentUseCase.ts`; objective: find document in organization, reject duplicate target name, save updated entity, and return read model; dependencies: T018 and T020; acceptance: T014 update tests pass.
- [X] T024 [US1] Create `DeleteOrganizationRequiredDocumentUseCase` in `packages/api/src/modules/organization-documents/application/use-cases/DeleteOrganizationRequiredDocumentUseCase.ts`; objective: delete only same-organization unused documents; dependencies: T018 and T020; acceptance: T015 delete tests pass.
- [X] T025 [US1] Create required-document Zod and JSON schemas in `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.ts`; objective: define params/body/list/response/error schemas for required-document endpoints; dependencies: T016; acceptance: schemas are strict, trim text, reject whitespace-only names, and tests in T016 pass.
- [X] T026 [US1] Create presenter functions in `packages/api/src/modules/organization-documents/presentation/http/organization-document-presenter.ts`; objective: convert required-document read models to HTTP ISO timestamp responses; dependencies: T018; acceptance: no Date object is returned directly in HTTP responses.
- [X] T027 [US1] Create use-case factory entries in `packages/api/src/modules/organization-documents/infrastructure/create-organization-document-use-cases.factory.ts`; objective: wire organization repository, transaction manager, and required-document Prisma repository; dependencies: T020 through T024; acceptance: factory returns create/list/update/delete use cases without importing Fastify.
- [X] T028 [US1] Create required-document handlers inside `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`; objective: implement POST/GET/PUT/DELETE handler bodies with Zod `safeParse`; dependencies: T021 through T027; acceptance: handlers return 201, 200, and 204 as specified and rely on global error handler for application errors.
- [X] T029 [US1] Register required-document routes in `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`; objective: expose `/organizations/:organizationId/required-documents` and `/:documentId`; dependencies: T028; acceptance: all four Required Documents contract paths are registered with Fastify schemas.
- [X] T030 [US1] Register `organizationDocumentRoutes` in `packages/api/src/shared/presentation/http/fastify/app.ts`; objective: include required-document route plugin in app startup; dependencies: T029; acceptance: route plugin is registered with other feature routes and no auth/RBAC middleware is introduced.

**Checkpoint**: User Story 1 should be independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Criar e Consultar Aprovações de Documentos por Paciente (Priority: P2)

**Goal**: Allow creation and listing of one pending approval per required document and patient, scoped to the route organization.

**Independent Test**: Create an approval for a patient and required document in the same organization, list patient approvals, and verify duplicate approvals and cross-organization mismatches fail.

### Tests for User Story 2

- [X] T031 [P] [US2] Add approval aggregate creation tests in `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.test.ts`; objective: cover initial `PENDING`, null `rejectedReason`, required IDs, and duplicate-invariant assumptions; dependencies: T003; acceptance: tests fail before aggregate exists and pass after T036.
- [X] T032 [P] [US2] Add create approval use-case tests in `packages/api/src/modules/organization-documents/application/use-cases/CreatePatientDocumentApprovalUseCase.test.ts`; objective: cover pending creation, document organization mismatch, patient organization mismatch, and duplicate approval conflict; dependencies: T009 and T018; acceptance: tests use fakes and assert `ConflictError`/`NotFoundError`.
- [X] T033 [P] [US2] Add list approval use-case tests in `packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalsUseCase.test.ts`; objective: cover listing only approvals for requested organization and patient; dependencies: T009; acceptance: cross-tenant approval is not returned.
- [X] T034 [P] [US2] Extend schema tests in `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.test.ts`; objective: cover create/list approval params and create approval body with required `documentId`; dependencies: T025; acceptance: body with `organizationUserId` is not required for create approval.

### Implementation for User Story 2 - Parte B Patient Document Approvals Creation/List

- [X] T035 [P] [US2] Create `OrganizationDocumentApprovalLog` entity in `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentApprovalLog.ts`; objective: validate action, `patientApprovalId`, and `organizationUserId`; dependencies: T004; acceptance: entity exposes append-only data with no update methods.
- [X] T036 [US2] Create `OrganizationDocumentPatientApproval` aggregate root in `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.ts`; objective: enforce required IDs, initial `PENDING`, and status/reason invariants; dependencies: T003 and T031; acceptance: T031 tests pass.
- [X] T037 [US2] Create approval and log repository interfaces in `packages/api/src/modules/organization-documents/application/repositories/OrganizationDocumentPatientApprovalRepository.ts` and `packages/api/src/modules/organization-documents/application/repositories/OrganizationDocumentApprovalLogRepository.ts`; objective: define scoped approval lookup/list/create/save and log create/list; dependencies: T035 and T036; acceptance: interfaces include no update/delete methods for logs.
- [X] T038 [P] [US2] Create approval Prisma mapper in `packages/api/src/modules/organization-documents/infrastructure/prisma/OrganizationDocumentPatientApprovalMapper.ts`; objective: map Prisma approval status to domain enum and read model; dependencies: T005 and T036; acceptance: mapper preserves `rejectedReason` null semantics.
- [X] T039 [P] [US2] Create log Prisma mapper in `packages/api/src/modules/organization-documents/infrastructure/prisma/OrganizationDocumentApprovalLogMapper.ts`; objective: map persisted action string to `DocumentApprovalAction` and log read model; dependencies: T005 and T035; acceptance: mapper returns ISO-ready Date fields as read model Dates.
- [X] T040 [US2] Create approval Prisma repository in `packages/api/src/modules/organization-documents/infrastructure/prisma/PrismaOrganizationDocumentPatientApprovalRepository.ts`; objective: implement scoped approval repository; dependencies: T037 and T038; acceptance: `findByIdForPatientInOrganization` filters through document organization and patient ID, not approval ID alone.
- [X] T041 [US2] Create log Prisma repository in `packages/api/src/modules/organization-documents/infrastructure/prisma/PrismaOrganizationDocumentApprovalLogRepository.ts`; objective: implement append-only log create/list; dependencies: T037 and T039; acceptance: repository has no save/delete method and list orders by `createdAt`.
- [X] T042 [US2] Create `CreatePatientDocumentApprovalUseCase` in `packages/api/src/modules/organization-documents/application/use-cases/CreatePatientDocumentApprovalUseCase.ts`; objective: verify organization, patient ownership, document ownership, duplicate approval, and create `PENDING`; dependencies: T010, T018, T037, and T040; acceptance: T032 tests pass and no log actor is required in input.
- [X] T043 [US2] Create `ListPatientDocumentApprovalsUseCase` in `packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalsUseCase.ts`; objective: verify patient belongs to organization and list approvals scoped to patient/organization; dependencies: T010 and T040; acceptance: T033 tests pass.
- [X] T044 [US2] Extend use-case factory in `packages/api/src/modules/organization-documents/infrastructure/create-organization-document-use-cases.factory.ts`; objective: wire approval and log repositories plus create/list approval use cases; dependencies: T040 through T043; acceptance: factory exposes `createPatientDocumentApprovalUseCase` and `listPatientDocumentApprovalsUseCase`.
- [X] T045 [US2] Extend Zod and JSON schemas in `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.ts`; objective: add patient approval params, create body, list response, and approval response schemas; dependencies: T034; acceptance: schema tests in T034 pass.
- [X] T046 [US2] Extend presenter in `packages/api/src/modules/organization-documents/presentation/http/organization-document-presenter.ts`; objective: map approval read models to HTTP responses with ISO timestamps and null `rejectedReason`; dependencies: T038; acceptance: `PENDING` approval response matches OpenAPI contract.
- [X] T047 [US2] Add create/list approval handlers in `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`; objective: implement POST and GET under `/organizations/:organizationId/patients/:patientId/document-approvals`; dependencies: T042 through T046; acceptance: handlers return 201 and 200 and validate params/body with Zod.
- [X] T048 [US2] Register create/list approval routes in `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`; objective: expose approval creation/listing paths in the same route plugin; dependencies: T047; acceptance: both Patient Document Approval base paths from OpenAPI are registered.

**Checkpoint**: User Story 2 should be independently functional after User Story 1 provides required documents.

---

## Phase 5: User Story 3 - Aprovar, Rejeitar e Resetar com Auditoria (Priority: P3)

**Goal**: Allow approve/reject/reset transitions on patient document approvals and append audit logs atomically.

**Independent Test**: Execute approve, reject, and reset on an approval; verify status, `rejectedReason`, and append-only logs in creation order.

### Tests for User Story 3

- [X] T049 [P] [US3] Extend approval aggregate tests in `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.test.ts`; objective: cover approve clears reason, reject requires reason, reset returns pending and clears reason, and idempotent transitions remain valid; dependencies: T036; acceptance: transition tests fail before methods exist and pass after T055.
- [X] T050 [P] [US3] Add approve use-case tests in `packages/api/src/modules/organization-documents/application/use-cases/ApprovePatientDocumentUseCase.test.ts`; objective: cover status change to `APPROVED`, reason clearing, and exactly one `APPROVED_DOCUMENT` log; dependencies: T037; acceptance: fake UnitOfWork proves save and log happen in one execution.
- [X] T051 [P] [US3] Add reject use-case tests in `packages/api/src/modules/organization-documents/application/use-cases/RejectPatientDocumentUseCase.test.ts`; objective: cover `REJECTED`, required non-empty reason, and exactly one `REJECTED_DOCUMENT` log; dependencies: T037; acceptance: missing reason throws validation error and creates no log.
- [X] T052 [P] [US3] Add reset use-case tests in `packages/api/src/modules/organization-documents/application/use-cases/ResetPatientDocumentToPendingUseCase.test.ts`; objective: cover `PENDING`, reason clearing, and exactly one `RESET_DOCUMENT_TO_PENDING` log; dependencies: T037; acceptance: reset behavior matches future resubmission semantics.
- [X] T053 [P] [US3] Add log listing use-case tests in `packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalLogsUseCase.test.ts`; objective: cover scoped approval lookup before log listing and append-only ordering; dependencies: T041; acceptance: approval from another organization/patient returns not found.
- [X] T054 [P] [US3] Extend schema tests in `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.test.ts`; objective: cover approve/reject/reset body validation and log params; dependencies: T045; acceptance: reject body requires trimmed non-empty `rejectedReason`, approve/reset require `organizationUserId`.

### Implementation for User Story 3 - Parte B Approval Workflow and Logs

- [X] T055 [US3] Implement transition methods in `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.ts`; objective: add `approve()`, `reject(reason)`, and `resetToPending()` with status/reason invariants; dependencies: T049; acceptance: T049 tests pass and methods return or expose the corresponding `DocumentApprovalAction`.
- [X] T056 [US3] Create `ApprovePatientDocumentUseCase` in `packages/api/src/modules/organization-documents/application/use-cases/ApprovePatientDocumentUseCase.ts`; objective: find scoped approval, approve it, save it, and append `APPROVED_DOCUMENT` log inside `UnitOfWork`; dependencies: T040, T041, and T055; acceptance: T050 tests pass.
- [X] T057 [US3] Create `RejectPatientDocumentUseCase` in `packages/api/src/modules/organization-documents/application/use-cases/RejectPatientDocumentUseCase.ts`; objective: find scoped approval, reject with required reason, save it, and append `REJECTED_DOCUMENT` log inside `UnitOfWork`; dependencies: T040, T041, and T055; acceptance: T051 tests pass.
- [X] T058 [US3] Create `ResetPatientDocumentToPendingUseCase` in `packages/api/src/modules/organization-documents/application/use-cases/ResetPatientDocumentToPendingUseCase.ts`; objective: find scoped approval, reset to pending, save it, and append `RESET_DOCUMENT_TO_PENDING` log inside `UnitOfWork`; dependencies: T040, T041, and T055; acceptance: T052 tests pass.
- [X] T059 [US3] Create `ListPatientDocumentApprovalLogsUseCase` in `packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalLogsUseCase.ts`; objective: verify scoped approval then return append-only logs; dependencies: T040 and T041; acceptance: T053 tests pass.
- [X] T060 [US3] Extend use-case factory in `packages/api/src/modules/organization-documents/infrastructure/create-organization-document-use-cases.factory.ts`; objective: wire approve/reject/reset/log-list use cases with shared `UnitOfWork`; dependencies: T056 through T059; acceptance: factory exposes all ten use cases planned in `plan.md`.
- [X] T061 [US3] Extend Zod and JSON schemas in `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.ts`; objective: add approve/reject/reset body schemas, approval-action params, log response schemas, and error response schemas; dependencies: T054; acceptance: T054 tests pass and schemas match OpenAPI.
- [X] T062 [US3] Extend presenter in `packages/api/src/modules/organization-documents/presentation/http/organization-document-presenter.ts`; objective: map log read models and transitioned approvals to HTTP responses; dependencies: T059; acceptance: log response includes `id`, `action`, `patientApprovalId`, `organizationUserId`, and ISO `createdAt`.
- [X] T063 [US3] Add approve/reject/reset/log handlers in `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`; objective: implement workflow route handlers with Zod parsing and global error handling; dependencies: T056 through T062; acceptance: handlers call the correct use case and never implement auth/RBAC.
- [X] T064 [US3] Register approve/reject/reset/log routes in `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`; objective: expose all remaining Patient Document Approval contract paths; dependencies: T063; acceptance: OpenAPI paths for approve, reject, reset-to-pending, and logs are represented in Fastify route schemas.

**Checkpoint**: All three user stories should now be independently functional.

---

## Phase 6: Tests and Validation

**Purpose**: Run validation gates only. Test definitions live in the domain, application, presentation, and integration tasks above.

- [X] T065 Run Prisma generation with `pnpm prisma:generate`; objective: validate schema and generated client; dependencies: T005 and T006; acceptance: command exits 0.
- [X] T066 Run API typecheck with `pnpm typecheck:api`; objective: verify TypeScript API correctness; dependencies: T065; acceptance: command exits 0.
- [X] T067 Run API lint with `pnpm --filter @flora/api lint`; objective: verify API lint rules; dependencies: T066; acceptance: command exits 0 or lint gaps are documented with exact failures.
- [X] T068 Run API tests with `pnpm test:api`; objective: verify domain, application, presentation-schema, and integration coverage assigned in earlier tasks; dependencies: T011 through T064; acceptance: command exits 0.
- [X] T069 Run API build with `pnpm build:api`; objective: verify distributable API build; dependencies: T066 and T068; acceptance: command exits 0.
- [ ] T070 Run quickstart manual scenarios from `specs/008-backend-document-approvals/quickstart.md`; objective: verify end-to-end backend behavior without frontend/upload/storage; dependencies: T065 through T069; acceptance: required document CRUD, approval create/list, approve/reject/reset, and logs behave as documented.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundation (Phase 2)**: Depends on Setup and blocks all user stories.
- **US1 Required Documents (Phase 3)**: Depends on Foundation.
- **US2 Approval Create/List (Phase 4)**: Depends on Foundation and uses required documents from US1 for full end-to-end validation.
- **US3 Approval Workflow/Logs (Phase 5)**: Depends on US2 approval persistence and repositories.
- **Validation (Phase 6)**: Depends on implemented user stories.

### User Story Dependencies

- **US1 (P1)**: MVP. Can be implemented after Foundation and tested independently.
- **US2 (P2)**: Depends on Foundation and integrates with required documents; can use repository fakes before US1 routes are complete.
- **US3 (P3)**: Depends on approval aggregate/repositories from US2.

### Requested Order Mapping

- Foundation request items 1-3 map to T003-T010.
- Parte A request items 4-15 map to T011-T030.
- Parte B request items 16-30 map to T031-T064.
- Tests requested in items 31-38 are assigned once in story-specific domain/application tasks: required-document uniqueness in T012, delete-blocked in T015, pending creation and duplicate approval in T032, approve/reject/reset/log assertions in T049-T053.
- HTTP/integration coverage is assigned to presentation schema tasks T016, T034, and T054, plus quickstart validation in T070 unless a project-level Fastify inject pattern is added during implementation.
- Final validation request items 40-42 map to T066-T068.

---

## Parallel Opportunities

- T003 and T004 can run in parallel after T001.
- T011 through T016 can run in parallel after Foundation because they touch different test files or test sections.
- T017 and T018 are sequential, but T023 and T024 can proceed after their respective dependencies while use cases are being finished.
- T031 through T034 can run in parallel after Foundation.
- T038 and T039 can run in parallel after their domain entities exist.
- T049 through T054 can run in parallel after US2 repositories and aggregate exist.
- T065 through T070 are sequential validation gates after implementation tasks complete.

## Parallel Example: User Story 1

```text
Task: "T011 Add domain tests for required document validation in packages/api/src/modules/organization-documents/domain/entities/OrganizationRequiredDocument.test.ts"
Task: "T012 Add create required-document use-case tests in packages/api/src/modules/organization-documents/application/use-cases/CreateOrganizationRequiredDocumentUseCase.test.ts"
Task: "T013 Add list required-document use-case tests in packages/api/src/modules/organization-documents/application/use-cases/ListOrganizationRequiredDocumentsUseCase.test.ts"
Task: "T014 Add update required-document use-case tests in packages/api/src/modules/organization-documents/application/use-cases/UpdateOrganizationRequiredDocumentUseCase.test.ts"
Task: "T015 Add delete-specific use-case tests in packages/api/src/modules/organization-documents/application/use-cases/DeleteOrganizationRequiredDocumentUseCase.test.ts"
Task: "T016 Add Zod schema tests in packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "T031 Add approval aggregate creation tests in packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.test.ts"
Task: "T032 Add create approval use-case tests in packages/api/src/modules/organization-documents/application/use-cases/CreatePatientDocumentApprovalUseCase.test.ts"
Task: "T033 Add list approval use-case tests in packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalsUseCase.test.ts"
Task: "T034 Extend schema tests in packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.test.ts"
```

## Parallel Example: User Story 3

```text
Task: "T050 Add approve use-case tests in packages/api/src/modules/organization-documents/application/use-cases/ApprovePatientDocumentUseCase.test.ts"
Task: "T051 Add reject use-case tests in packages/api/src/modules/organization-documents/application/use-cases/RejectPatientDocumentUseCase.test.ts"
Task: "T052 Add reset use-case tests in packages/api/src/modules/organization-documents/application/use-cases/ResetPatientDocumentToPendingUseCase.test.ts"
Task: "T053 Add log listing use-case tests in packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalLogsUseCase.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for Required Documents.
3. Stop and validate required-document CRUD, duplicate-name handling, and delete-blocked behavior.

### Incremental Delivery

1. Foundation: Prisma schema, enums, scoped patient lookup, and error review.
2. US1: Required Documents CRUD.
3. US2: Patient approval creation/listing.
4. US3: Approval workflow transitions and logs.
5. Validation: Prisma generation, typecheck, lint, tests, build, and quickstart.

### Scope Guardrails

- Do not create or modify `packages/web`.
- Do not add upload, storage, cloud provider, file URL, presigned URL, download, preview, OCR, or file-validation code.
- Do not add auth/RBAC middleware or permission checks.
- Do not add pet-document logic.
- Do not refactor unrelated modules except the scoped `PatientRepository` method required for tenant validation.

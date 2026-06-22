# Tasks: Upload Backend de Documentos do Paciente

**Input**: Design documents from `/specs/009-patient-document-upload/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/patient-document-upload.openapi.yaml](./contracts/patient-document-upload.openapi.yaml)

**Tests**: Automated tests are required because this feature changes API contracts, tenant isolation, validation, persistence, storage integration, document workflow, and audit logs.

**Organization**: Tasks are ordered by backend layer and grouped by user story. User Story 1 is upload/reupload, User Story 2 is approval listing with generated file URLs, and User Story 3 is invalid upload rejection.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after dependencies are met because it touches different files or has no dependency on incomplete tasks.
- **[Story]**: Maps task to the user story from `spec.md`.
- Every task includes file path, objective, dependencies, and acceptance criteria.

## Phase 1: Foundation - Domain, Persistence, Storage Setup

**Purpose**: Prepare shared backend primitives that block all upload stories.

- [X] T001 Extend approval domain props in `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.ts`; objective: add nullable `fileName`, `mimeType`, `size`, and `storageKey` getters/props; dependencies: none; acceptance: entity can represent approvals with and without uploaded file metadata without importing Prisma/Fastify/Zod/HTTP.
- [X] T002 Add domain upload transition in `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.ts`; objective: implement `attachUploadedFile` validating file metadata, setting status `PENDING`, and clearing `rejectedReason`; dependencies: T001; acceptance: method returns upload audit action and rejects blank filename, blank MIME, non-positive size, or blank storage key.
- [X] T003 Extend upload audit action in `packages/api/src/modules/organization-documents/domain/enums/DocumentApprovalAction.ts`; objective: add `UploadedDocument = "UPLOADED_DOCUMENT"`; dependencies: none; acceptance: enum persists exact string required by contract.
- [X] T004 Update Prisma approval model in `packages/api/prisma/schema.prisma`; objective: add nullable `fileName`, `mimeType`, `size`, and `storageKey` to `OrganizationDocumentPatientApproval`; dependencies: T001; acceptance: schema has no final URL, bucket, access key, secret, direct browser upload, or file-version table.
- [X] T005 Create Prisma migration in `packages/api/prisma/migrations/<timestamp>_patient_document_upload_metadata/migration.sql`; objective: add file metadata columns to `organization_document_patient_approvals`; dependencies: T004; acceptance: migration only adds nullable metadata/storage-key columns and does not create old-file deletion behavior.
- [X] T006 Add upload dependencies in `packages/api/package.json`; objective: add `@fastify/multipart`, `@aws-sdk/client-s3`, and `@aws-sdk/s3-request-presigner`; dependencies: none; acceptance: dependencies are API-only and no frontend package is touched.
- [X] T007 Create storage service port in `packages/api/src/modules/organization-documents/application/services/DocumentStorageService.ts`; objective: define `DocumentStorageService`, `UploadDocumentInput`, and `UploadDocumentOutput`; dependencies: none; acceptance: application port exposes `upload` and `getDownloadUrl` and imports no Cloudflare/AWS/Fastify/Prisma types.
- [X] T008 Implement Cloudflare R2 storage adapter in `packages/api/src/modules/organization-documents/infrastructure/storage/CloudflareR2DocumentStorageService.ts`; objective: implement upload and signed download URL generation through R2-compatible storage; dependencies: T006 and T007; acceptance: adapter keeps credentials private and returns only storage key or generated URL.
- [X] T009 Validate R2 and upload env in `packages/api/src/config/env.ts`; objective: add R2 credentials, bucket, signed URL expiry, max upload size, and allowed MIME list parsing; dependencies: T006; acceptance: invalid env fails fast with Zod and defaults only for safe local values like MIME allowlist/expiry when appropriate.
- [X] T010 Add multipart Fastify plugin in `packages/api/src/shared/presentation/http/fastify/plugins/multipart.ts`; objective: configure multipart limits from env; dependencies: T006 and T009; acceptance: plugin centralizes multipart parsing and enforces max file size.
- [X] T011 Register multipart plugin in `packages/api/src/shared/presentation/http/fastify/app.ts`; objective: register multipart before feature routes; dependencies: T010; acceptance: route handlers can read multipart files and no auth/RBAC middleware is introduced.

**Checkpoint**: Shared domain, persistence, storage, env, and multipart setup are planned.

---

## Phase 2: User Story 1 - Enviar Arquivo Para Aprovação (Priority: P1) MVP

**Goal**: Upload or reupload one file for an existing patient document approval, reset the approval to pending, persist file metadata/storage key, and append upload audit log.

**Independent Test**: Upload a valid PDF/JPEG/PNG for a scoped approval and verify metadata, status `PENDING`, `rejectedReason: null`, storage upload, and one `UPLOADED_DOCUMENT` log.

### Implementation for User Story 1

- [X] T012 [US1] Update approval mapper in `packages/api/src/modules/organization-documents/infrastructure/prisma/OrganizationDocumentPatientApprovalMapper.ts`; objective: map file metadata fields to domain, read model, create persistence, and update persistence; dependencies: T004; acceptance: mapper preserves null metadata and persists replacements on save.
- [X] T013 [US1] Update approval repository interface in `packages/api/src/modules/organization-documents/application/repositories/OrganizationDocumentPatientApprovalRepository.ts`; objective: include `fileName`, `mimeType`, `size`, `storageKey`, and optional `fileUrl` in approval read model; dependencies: T007 and T012; acceptance: repository contract remains Prisma-free and supports upload response data.
- [X] T014 [US1] Update approval Prisma repository in `packages/api/src/modules/organization-documents/infrastructure/prisma/PrismaOrganizationDocumentPatientApprovalRepository.ts`; objective: return and persist file metadata through scoped approval queries and `save`; dependencies: T012 and T013; acceptance: scoped lookup still filters by route organization and patient, not approval ID alone.
- [X] T015 [US1] Create `UploadPatientDocumentUseCase` in `packages/api/src/modules/organization-documents/application/use-cases/UploadPatientDocumentUseCase.ts`; objective: validate scoped approval, generate storage key, call storage upload, attach metadata, save approval, and append `UPLOADED_DOCUMENT` log; dependencies: T002, T003, T007, T013, and T014; acceptance: use case depends only on repository/storage interfaces and `UnitOfWork`, with no R2/Fastify/Zod/Prisma imports.
- [X] T016 [US1] Wire upload use case in `packages/api/src/modules/organization-documents/infrastructure/create-organization-document-use-cases.factory.ts`; objective: instantiate R2 storage adapter and expose `uploadPatientDocumentUseCase`; dependencies: T008, T009, T014, and T015; acceptance: factory returns upload use case without importing Fastify.
- [X] T017 [US1] Add upload params and response schemas in `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.ts`; objective: define upload params, extended approval response, file metadata fields, `fileUrl`, and upload error responses; dependencies: T013; acceptance: schemas match OpenAPI and include no R2 credentials/bucket fields.
- [X] T018 [US1] Add upload response presenter fields in `packages/api/src/modules/organization-documents/presentation/http/organization-document-presenter.ts`; objective: include `fileName`, `mimeType`, `size`, `storageKey`, and `fileUrl` in approval HTTP responses; dependencies: T013 and T017; acceptance: presenter returns ISO dates and never generates URLs itself.
- [X] T019 [US1] Create upload route handler in `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`; objective: parse upload params, read exactly one multipart file, validate required metadata, call upload use case, and return updated approval; dependencies: T011, T015, T016, T017, and T018; acceptance: route exposes `POST /organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/upload` and uses global error handling for application/domain errors.
- [X] T020 [US1] Register upload route schema in `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`; objective: add Fastify route schema for multipart upload and extended response; dependencies: T019; acceptance: OpenAPI path from contract is represented and no direct browser/presigned POST route is added.

**Checkpoint**: User Story 1 should be independently testable as the MVP.

---

## Phase 3: User Story 2 - Consultar Aprovações Com URL de Arquivo (Priority: P2)

**Goal**: Return file metadata and read-time generated `fileUrl` for approvals that have `storageKey`, while returning `fileUrl: null` for approvals without files.

**Independent Test**: List approvals for one patient and verify URL generation only for approvals with `storageKey`, with no cross-tenant data or credentials exposed.

### Implementation for User Story 2

- [X] T021 [US2] Update list approval use case in `packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalsUseCase.ts`; objective: inject `DocumentStorageService` and generate `fileUrl` for read models with `storageKey`; dependencies: T007 and T013; acceptance: approvals without storage key return `fileUrl: null` and application imports no R2/Fastify/Prisma.
- [X] T022 [US2] Update factory list wiring in `packages/api/src/modules/organization-documents/infrastructure/create-organization-document-use-cases.factory.ts`; objective: pass R2 storage service into `ListPatientDocumentApprovalsUseCase`; dependencies: T008, T016, and T021; acceptance: list use case and upload use case share the same storage adapter wiring.
- [X] T023 [US2] Update list response schema in `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.ts`; objective: ensure approval list response requires file metadata and `fileUrl`; dependencies: T017 and T021; acceptance: response contract matches `contracts/patient-document-upload.openapi.yaml`.
- [X] T024 [US2] Update GET/list handler response in `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`; objective: return enriched approval read models with generated `fileUrl`; dependencies: T018, T021, T022, and T023; acceptance: existing GET route shape includes upload fields without changing route path.

**Checkpoint**: User Story 2 should be independently testable after upload metadata exists.

---

## Phase 4: User Story 3 - Rejeitar Uploads Inválidos (Priority: P3)

**Goal**: Reject missing, empty, oversized, or unsupported uploads before storage or metadata changes.

**Independent Test**: Submit invalid uploads and verify no storage upload, metadata update, status reset, or log creation occurs.

### Implementation for User Story 3

- [X] T025 [US3] Add upload validation helper in `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.ts`; objective: centralize allowed MIME type, required filename, and size validation inputs for upload handler; dependencies: T009 and T017; acceptance: validation rejects missing file, blank filename, blank MIME, unsupported MIME, zero size, and oversize cases.
- [X] T026 [US3] Harden upload handler validation in `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`; objective: ensure invalid uploads return structured validation errors before calling use case; dependencies: T019 and T025; acceptance: invalid upload paths do not call storage service or repositories.
- [X] T027 [US3] Add storage failure mapping guidance in `packages/api/src/modules/organization-documents/application/use-cases/UploadPatientDocumentUseCase.ts`; objective: ensure storage upload failures surface as structured unexpected/application errors without partial metadata/log writes; dependencies: T015; acceptance: failed storage upload does not execute approval save or log append.

**Checkpoint**: Invalid upload behavior should be independently testable.

---

## Phase 5: Tests

**Purpose**: Add focused automated tests by layer without duplicating coverage.

- [X] T028 [P] [US1] Add domain metadata tests in `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.test.ts`; objective: cover `attachUploadedFile`, metadata validation, status reset to `PENDING`, `rejectedReason` clearing, and `UPLOADED_DOCUMENT`; dependencies: T001 through T003; acceptance: tests are domain-only and import no Prisma/Fastify/Zod/R2.
- [X] T029 [P] [US1] Add upload use-case tests in `packages/api/src/modules/organization-documents/application/use-cases/UploadPatientDocumentUseCase.test.ts`; objective: cover successful upload, reupload from rejected, scoped approval not found, storage key generation, save/log inside UnitOfWork, and fake storage call; dependencies: T015; acceptance: tests use fake repositories/storage and assert exactly one upload log on success.
- [X] T030 [P] [US2] Add list file URL tests in `packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalsUseCase.test.ts`; objective: cover `fileUrl` generation when `storageKey` exists and null URL when absent; dependencies: T021; acceptance: tests use fake storage and do not cover upload mutation behavior.
- [X] T031 [P] [US3] Add upload validation schema tests in `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.test.ts`; objective: cover upload params, response schema fields, MIME allowlist, size limit, and blank metadata validation helpers; dependencies: T017 and T025; acceptance: tests stay at presentation validation boundary and do not call use cases.
- [X] T032 [P] [US1] Add R2 adapter unit tests in `packages/api/src/modules/organization-documents/infrastructure/storage/CloudflareR2DocumentStorageService.test.ts`; objective: cover endpoint construction, bucket/key usage, upload command input, and signed URL generation with mocked SDK client; dependencies: T008 and T009; acceptance: tests do not perform network calls or require real R2 credentials.
- [X] T033 [US1] Add HTTP multipart route tests in `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.test.ts` only if existing Fastify inject can be used with faked use cases; objective: cover upload route status and validation; dependencies: T019 and T026; acceptance: either route tests pass or quickstart documents manual route validation as the project pattern.

---

## Phase 6: Validation

**Purpose**: Run validation gates only. Test definitions live in earlier tasks.

- [X] T034 Run Prisma generation with `pnpm prisma:generate`; objective: validate schema and generated client; dependencies: T004 and T005; acceptance: command exits 0.
- [X] T035 Run API typecheck with `pnpm typecheck:api`; objective: verify TypeScript API correctness; dependencies: T034 and T028 through T033; acceptance: command exits 0.
- [X] T036 Run API lint with `pnpm --filter @flora/api lint`; objective: verify API lint rules; dependencies: T035; acceptance: command exits 0 or exact lint failures are documented.
- [X] T037 Run API tests with `pnpm test:api`; objective: verify domain, application, infrastructure, schema, and optional HTTP coverage; dependencies: T028 through T033; acceptance: command exits 0.
- [X] T038 Run API build with `pnpm build:api`; objective: verify distributable API build; dependencies: T035 and T037; acceptance: command exits 0.
- [X] T039 Run migration when database is available with `pnpm prisma:migrate`; objective: apply upload metadata migration locally; dependencies: T034; acceptance: command exits 0 or database/schema-engine blocker is documented.
- [ ] T040 Run quickstart scenarios from `specs/009-patient-document-upload/quickstart.md`; objective: manually validate upload, reupload, listing with file URLs, invalid uploads, and negative scope checks; dependencies: T034 through T039; acceptance: scenarios match expected outcomes without frontend/auth/RBAC changes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundation (Phase 1)**: No prior feature work beyond existing document approvals.
- **US1 Upload (Phase 2)**: Depends on foundation tasks T001-T011.
- **US2 Read URLs (Phase 3)**: Depends on storage port/adapter and read-model changes from US1.
- **US3 Invalid Uploads (Phase 4)**: Depends on upload route/use case.
- **Tests (Phase 5)**: Depend on their target implementation tasks.
- **Validation (Phase 6)**: Depends on implementation and test tasks.

### User Story Dependencies

- **US1 (P1)**: MVP. Delivers backend upload/reupload and audit log.
- **US2 (P2)**: Builds on metadata/storage key from US1 to generate file URLs on read.
- **US3 (P3)**: Hardens upload validation once upload path exists.

### Requested Order Mapping

- Requested items 1-3 map to T001-T003.
- Requested items 4-5 map to T004-T005.
- Requested items 6-7 map to T007.
- Requested items 8-10 map to T006, T008-T011.
- Requested items 11-12 map to T012-T014.
- Requested item 13 maps to T015-T016.
- Requested item 14 maps to T021-T024.
- Requested items 15-18 map to T017-T020 and T025-T026.
- Requested items 19-21 map to T028-T033.
- Requested items 22-26 map to T034-T038.

### Parallel Opportunities

- T001 and T003 can run in parallel.
- T006, T007, and T009 can run in parallel after dependency decisions are accepted.
- T012 and T013 can proceed in parallel after T004/T007.
- T017 and T018 can proceed in parallel after T013.
- T028 through T032 can run in parallel after their implementation dependencies.
- Final validation gates T034-T040 are sequential.

## Parallel Example: User Story 1

```text
Task: "T028 Add domain metadata tests in packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.test.ts"
Task: "T029 Add upload use-case tests in packages/api/src/modules/organization-documents/application/use-cases/UploadPatientDocumentUseCase.test.ts"
Task: "T032 Add R2 adapter unit tests in packages/api/src/modules/organization-documents/infrastructure/storage/CloudflareR2DocumentStorageService.test.ts"
```

## Parallel Example: User Story 2

```text
Task: "T030 Add list file URL tests in packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalsUseCase.test.ts"
Task: "T023 Update list response schema in packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.ts"
```

## Parallel Example: User Story 3

```text
Task: "T031 Add upload validation schema tests in packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.test.ts"
Task: "T027 Add storage failure mapping guidance in packages/api/src/modules/organization-documents/application/use-cases/UploadPatientDocumentUseCase.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Foundation tasks T001-T011.
2. Complete upload implementation T012-T020.
3. Complete upload-focused tests T028, T029, and T032.
4. Run `pnpm prisma:generate`, `pnpm typecheck:api`, `pnpm test:api`, and `pnpm build:api`.

### Incremental Delivery

1. Foundation: domain metadata, action enum, schema/migration, storage port, env, multipart.
2. US1: upload/reupload with R2, metadata persistence, status reset, and log.
3. US2: generated `fileUrl` on approval listing.
4. US3: invalid upload rejection hardening.
5. Validation: Prisma generation, typecheck, lint, tests, build, migration, quickstart.

### Scope Guardrails

- Do not create or modify `packages/web`.
- Do not add direct browser upload, presigned POST, old-file deletion, OCR, antivirus, content validation, cookies, IronSession, new auth, RBAC, or permission middleware.
- Do not save final public URL, signed URL, bucket, access key, secret, or account id in the database.
- Do not move storage SDK, multipart, Prisma, Fastify, or Zod dependencies into domain/application business rules.

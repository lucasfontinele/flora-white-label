# Implementation Plan: Upload Backend de Documentos do Paciente

**Branch**: `(not set; spec directory 009-patient-document-upload)` | **Date**: 2026-06-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-patient-document-upload/spec.md`

## Summary

Build an API-only backend slice that extends the existing patient document
approval workflow with document file upload to Cloudflare R2. The feature adds
file metadata to `OrganizationDocumentPatientApproval`, stores only a
backend-generated storage key in persistence, uploads files through an
application storage port implemented in infrastructure, resets approval status
to `PENDING` on upload/reupload, clears `rejectedReason`, appends an
`UPLOADED_DOCUMENT` audit log, and enriches approval list responses with a
read-time generated `fileUrl`.

The plan explicitly excludes frontend, UI, direct browser upload, presigned
POST, old-file deletion, OCR, antivirus, new authentication, RBAC, permission
middleware, cookies, IronSession, and unrelated refactors.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js runtime, ES2022 target,
NodeNext module resolution. No explicit Node engine is declared.

**Primary Dependencies**: `packages/api` currently uses Fastify 5.8.5, Prisma
6.19.3, PostgreSQL, Zod 4.4.3, Vitest 4.1.9, and existing shared
domain/application helpers. This feature needs a multipart parser dependency
(`@fastify/multipart`) because none is configured today, plus an R2-compatible
object-storage client in infrastructure, expected to be AWS S3-compatible SDK
packages (`@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`) unless
implementation discovers an already-approved local alternative.

**Storage**: PostgreSQL through Prisma for metadata; Cloudflare R2 for document
objects. Persistence stores `fileName`, `mimeType`, `size`, and `storageKey`,
never final public URLs or credentials.

**Testing**: Vitest unit tests for domain metadata invariants and
`UploadPatientDocumentUseCase` with fake storage/repositories; schema tests for
upload params and response shape; optional Fastify inject HTTP tests only if
multipart route testing is feasible without real R2/database. Validation gates:
`pnpm prisma:generate`, `pnpm typecheck:api`, `pnpm --filter @flora/api lint`,
`pnpm test:api`, and `pnpm build:api`.

**Target Platform**: Fastify API runtime only.

**Project Type**: pnpm monorepo, API-only change under `packages/api` plus
feature documentation under `specs/009-patient-document-upload`.

**Performance Goals**: 95% of valid uploads within configured size limits should
complete in under 5 seconds in development/homologation. 95% of patient
approval list requests with generated file URLs should complete in under 2
seconds for typical patient approval counts.

**Constraints**: Do not alter `packages/web`. Do not implement direct browser
upload, presigned POST, old-file deletion, OCR, antivirus, content validation,
new auth, RBAC, permission middleware, cookies, IronSession, or required
document editing. Domain must not depend on R2, SDKs, Fastify, Prisma, Zod, HTTP
or multipart parsing. Application must depend only on repository/storage
interfaces and `UnitOfWork`.

**Scale/Scope**: One upload endpoint, one storage port, one R2 adapter, one
upload use case, one new audit action, file metadata on one existing Prisma
model, one migration, response updates for existing approval list/command
outputs, and focused tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: PASS. Implementation is limited to `packages/api`
  and feature documentation. `packages/web` remains untouched.
- **Shared Contracts**: PASS. The upload request, extended approval response,
  metadata fields, generated `fileUrl`, upload log action, and storage errors
  are documented in `contracts/patient-document-upload.openapi.yaml`. Types stay
  package-local because no frontend/shared consumer is implemented in this
  backend-only slice.
- **Tenant Isolation**: PASS. Upload and read operations are scoped by
  `organizationId` and `patientId` route params. Approval repository lookups
  must verify the approval belongs to both route values before upload, metadata
  update, log listing, or URL generation.
- **Clean Layering**: PASS. Domain owns status/reason/file-metadata invariants;
  application owns orchestration through `DocumentStorageService`; infrastructure
  owns Cloudflare R2 and Prisma; presentation owns multipart parsing, Zod/env
  validation usage, and Fastify route wiring.
- **Verifiable Delivery**: PASS. User stories are independently testable:
  upload/reupload, listing with generated file URL, and invalid upload
  rejection. Verification covers tenant isolation, validation, persistence,
  storage adapter boundaries, audit logs, and absence of frontend/auth/RBAC.

## Project Structure

### Documentation (this feature)

```text
specs/009-patient-document-upload/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── patient-document-upload.openapi.yaml
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/
└── api/
    ├── package.json
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    │       └── <timestamp>_patient_document_upload_metadata/
    │           └── migration.sql
    └── src/
        ├── config/
        │   └── env.ts
        ├── modules/
        │   └── organization-documents/
        │       ├── application/
        │       │   ├── services/
        │       │   │   └── DocumentStorageService.ts
        │       │   ├── repositories/
        │       │   │   └── OrganizationDocumentPatientApprovalRepository.ts
        │       │   └── use-cases/
        │       │       ├── UploadPatientDocumentUseCase.ts
        │       │       └── UploadPatientDocumentUseCase.test.ts
        │       ├── domain/
        │       │   ├── entities/
        │       │   │   └── OrganizationDocumentPatientApproval.ts
        │       │   └── enums/
        │       │       └── DocumentApprovalAction.ts
        │       ├── infrastructure/
        │       │   ├── create-organization-document-use-cases.factory.ts
        │       │   ├── storage/
        │       │   │   └── CloudflareR2DocumentStorageService.ts
        │       │   └── prisma/
        │       │       ├── OrganizationDocumentPatientApprovalMapper.ts
        │       │       └── PrismaOrganizationDocumentPatientApprovalRepository.ts
        │       └── presentation/http/
        │           ├── organization-document-presenter.ts
        │           ├── organization-document-routes.ts
        │           ├── organization-document-schemas.ts
        │           └── organization-document-schemas.test.ts
        └── shared/
            └── presentation/http/fastify/
                ├── app.ts
                └── plugins/
                    └── multipart.ts
```

**Structure Decision**: Extend the existing `modules/organization-documents`
bounded module because upload is part of the patient document approval workflow.
Storage integration gets a module-local application port and infrastructure
adapter because no shared storage abstraction exists today and this is the first
document-file use case.

## Current Architecture Analysis

- **`OrganizationDocumentPatientApproval`**:
  `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.ts`.
  It is the aggregate root for status transitions and currently has
  `organizationId`, `documentId`, `patientId`, `status`, and `rejectedReason`.
- **Approval use cases**:
  `packages/api/src/modules/organization-documents/application/use-cases/`
  contains create/list/approve/reject/reset/log-list use cases. Transition use
  cases use `UnitOfWork` and append `OrganizationDocumentApprovalLog`.
- **Repositories and Prisma mappers**:
  interfaces are in
  `packages/api/src/modules/organization-documents/application/repositories/`;
  Prisma mappers/repositories are in
  `packages/api/src/modules/organization-documents/infrastructure/prisma/`.
  `PrismaOrganizationDocumentPatientApprovalRepository` already scopes approval
  lookup by organization through `document: { organizationId }` and patient ID.
- **Handlers/routes Fastify**:
  `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`
  registers all required-document and patient-approval routes. It parses params
  and bodies with Zod `safeParse`, sends local 400 validation errors, and uses
  the global error handler for application/domain errors.
- **Multipart/form-data**:
  No multipart parser is configured. `package.json` has no
  `@fastify/multipart`, and no route currently uses `request.file()` or
  `request.parts()`. This feature must add and register multipart support in
  the API runtime.
- **Env validation**:
  `packages/api/src/config/env.ts` validates environment variables with Zod and
  exports a typed `env` object. R2 credentials, signed URL expiry, MIME allowlist
  and maximum upload size belong there.
- **Storage abstraction**:
  No generic storage port exists. Existing shared infrastructure includes
  cryptography, tokens, captcha, and Prisma transaction utilities, but no file
  storage service.
- **Logs/audit pattern**:
  The document approval feature uses a local `OrganizationDocumentApprovalLog`
  entity, `DocumentApprovalAction` enum, log repository, and append-only Prisma
  repository. No global audit framework exists.
- **UnitOfWork/transaction**:
  `UnitOfWork` and `PrismaTransactionManager` already exist. Upload metadata
  update and log append should run inside `UnitOfWork`; the actual R2 upload
  occurs before metadata persistence to ensure there is a storage key to save.
- **Migration need**:
  Required. `OrganizationDocumentPatientApproval` needs nullable `fileName`,
  `mimeType`, `size`, and `storageKey` columns. `DocumentApprovalAction` is
  persisted as string, so no Prisma enum migration is needed for log action.

## Target Architecture

1. **Domain**: Extend `OrganizationDocumentPatientApproval` with nullable file
   metadata and add `attachUploadedFile(input)` that validates file metadata,
   sets status to `PENDING`, clears `rejectedReason`, updates metadata, and
   returns `DocumentApprovalAction.UploadedDocument`.
2. **Action enum**: Add `UploadedDocument = "UPLOADED_DOCUMENT"` to
   `DocumentApprovalAction`.
3. **Persistence**: Add nullable `fileName`, `mimeType`, `size`, and
   `storageKey` to Prisma model and migration.
4. **Application storage port**: Add `DocumentStorageService` with
   `upload(input)` and `getDownloadUrl(storageKey)` plus typed
   `UploadDocumentInput` and `UploadDocumentOutput`.
5. **R2 infrastructure**: Add `CloudflareR2DocumentStorageService` using the
   configured R2 account, credentials, bucket, signed URL expiry, and generated
   backend storage keys. Do not expose credentials in responses.
6. **Multipart**: Add and register Fastify multipart plugin if no existing
   pattern appears during implementation. Upload route reads one file only and
   passes stream/buffer plus metadata to the use case.
7. **Upload use case**: Add `UploadPatientDocumentUseCase` that finds scoped
   approval, validates metadata through domain behavior, generates a storage key,
   uploads to R2 through the storage port, saves approval metadata, appends
   `UPLOADED_DOCUMENT` log inside `UnitOfWork`, and returns an approval read
   model.
8. **Read URL generation**: Update `ListPatientDocumentApprovalsUseCase` (and
   any single-approval command output chosen in implementation) to enrich read
   models with `fileUrl` by calling `DocumentStorageService.getDownloadUrl` only
   when `storageKey` exists.
9. **Presentation**: Add upload route, params schema, multipart validation,
   extended response schemas and presenter fields. Keep Zod/Fastify in
   presentation only.

## Files To Create

- `packages/api/src/modules/organization-documents/application/services/DocumentStorageService.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/UploadPatientDocumentUseCase.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/UploadPatientDocumentUseCase.test.ts`
- `packages/api/src/modules/organization-documents/infrastructure/storage/CloudflareR2DocumentStorageService.ts`
- `packages/api/src/shared/presentation/http/fastify/plugins/multipart.ts`
- `packages/api/prisma/migrations/<timestamp>_patient_document_upload_metadata/migration.sql`
- Optional HTTP route test:
  `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.test.ts`

## Files To Modify

- `packages/api/package.json`: add multipart and R2/S3-compatible SDK dependencies.
- `packages/api/prisma/schema.prisma`: add upload metadata columns to
  `OrganizationDocumentPatientApproval`.
- `packages/api/src/config/env.ts`: validate R2 credentials, bucket, URL expiry,
  MIME allowlist, and max upload size.
- `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.ts`:
  add file metadata and `attachUploadedFile`.
- `packages/api/src/modules/organization-documents/domain/enums/DocumentApprovalAction.ts`:
  add `UPLOADED_DOCUMENT`.
- `packages/api/src/modules/organization-documents/application/repositories/OrganizationDocumentPatientApprovalRepository.ts`:
  extend read models with metadata and optional generated URL.
- `packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalsUseCase.ts`:
  generate file URLs for list results.
- `packages/api/src/modules/organization-documents/infrastructure/prisma/OrganizationDocumentPatientApprovalMapper.ts`:
  map metadata fields.
- `packages/api/src/modules/organization-documents/infrastructure/prisma/PrismaOrganizationDocumentPatientApprovalRepository.ts`:
  persist metadata fields on save and return them in read models.
- `packages/api/src/modules/organization-documents/infrastructure/create-organization-document-use-cases.factory.ts`:
  wire storage service and upload/list use cases.
- `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.ts`:
  add upload params and extended approval response schema.
- `packages/api/src/modules/organization-documents/presentation/http/organization-document-presenter.ts`:
  include file metadata and `fileUrl`.
- `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`:
  add upload handler/route and update list response usage.
- `packages/api/src/modules/organization-documents/**/*.test.ts`: update tests
  for metadata, upload logs, and response shape.
- `packages/api/src/shared/presentation/http/fastify/app.ts`: register multipart
  plugin before routes.

## Migration Plan

Migration is required.

Add nullable fields to `OrganizationDocumentPatientApproval`:

```prisma
fileName   String?
mimeType   String?
size       Int?
storageKey String?
```

SQL migration should add nullable columns to
`organization_document_patient_approvals`. No table for files is introduced and
no final URL column is added. `storageKey` may get a non-unique index if query
patterns later require it, but this feature does not need uniqueness because
the backend-generated key includes route and timestamp context.

## Risks

- **Multipart memory usage**: Buffering large files in memory can exceed
  process limits. Mitigation: configure max file size and prefer streaming to
  R2 when the selected SDK/plugin pattern supports it cleanly.
- **Partial failure after R2 upload**: Metadata persistence may fail after the
  object is uploaded. Mitigation: return structured error and document orphan
  cleanup as future work; do not implement unsafe deletion in this slice.
- **Signed URL failures during list**: Generating a URL for each approval can
  fail or add latency. Mitigation: only call storage service when `storageKey`
  exists and propagate structured errors; keep typical patient approval counts
  small and measurable.
- **Actor ambiguity**: Upload logs may not have a patient user identity yet.
  Mitigation: allow optional actor only if existing context is available; do not
  create new auth/RBAC.
- **Dependency creep**: R2 requires S3-compatible SDK and multipart parser.
  Mitigation: keep both in infrastructure/presentation and out of domain and
  application business rules.
- **Old object accumulation**: Reupload leaves previous objects in R2. Mitigation:
  explicitly document cleanup as future work and do not silently delete.

## Implementation Order

1. Add R2/multipart dependencies and environment validation.
2. Add Prisma metadata fields and migration.
3. Extend domain approval entity and upload log action.
4. Add storage port and R2 adapter.
5. Update approval mapper/repository/read models.
6. Add upload use case and unit tests with fake storage.
7. Update list use case to generate file URLs.
8. Configure Fastify multipart plugin.
9. Add upload route, schemas, presenter updates, and optional HTTP tests.
10. Run Prisma generate, typecheck, lint, tests, build, and quickstart scenarios.

## Rollback Strategy

- Remove upload route registration/handler and multipart plugin registration.
- Remove `UploadPatientDocumentUseCase`, storage port, and R2 adapter.
- Remove metadata fields from repository/read-model/presenter/schema changes.
- Revert the Prisma migration and remove `fileName`, `mimeType`, `size`, and
  `storageKey` from `schema.prisma`, then regenerate Prisma client.
- Leave already-uploaded R2 objects for an explicit cleanup procedure; this
  feature intentionally does not implement automatic old-file deletion.
- No frontend or auth/RBAC rollback is needed because neither is in scope.

## Validation Commands

```bash
pnpm install
pnpm prisma:generate
pnpm typecheck:api
pnpm --filter @flora/api lint
pnpm test:api
pnpm build:api
pnpm prisma:migrate
```

`pnpm install` is needed only when adding multipart/R2 dependencies. Applying
the migration requires a reachable PostgreSQL database. Manual/API validation
is documented in [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Monorepo Boundaries**: PASS. Design stays in `packages/api` and docs.
- **Shared Contracts**: PASS. API and response changes are documented under
  `contracts/`; no `packages/shared` change is needed for this backend-only
  slice.
- **Tenant Isolation**: PASS. Upload, metadata writes, logs, and URL generation
  are scoped by organization and patient.
- **Clean Layering**: PASS. Domain/application stay free of R2 SDK, Fastify,
  Prisma, Zod, HTTP, and multipart details.
- **Verifiable Delivery**: PASS. Plan includes unit/schema/optional HTTP tests,
  migration validation, and quickstart API scenarios.

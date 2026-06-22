# Implementation Plan: Backend de Documentos Obrigatórios e Aprovações

**Branch**: `(not set; spec directory 008-backend-document-approvals)` | **Date**: 2026-06-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-backend-document-approvals/spec.md`

## Summary

Build an API-only backend slice for organization-required document configuration
and patient document approval workflow. The implementation stays inside
`packages/api`, adds a focused `organization-documents` module, introduces
Prisma persistence for required documents, patient approvals, approval logs, and
approval status enum, validates HTTP input with Zod at the presentation boundary,
keeps domain/application code free of Prisma/Fastify/Zod, uses repository
interfaces plus Prisma mappers/repositories, and uses the existing
`UnitOfWork`/`PrismaTransactionManager` for atomic approval state changes and
log writes.

The plan explicitly excludes frontend, upload, storage/cloud providers,
presigned URLs, download, file preview, OCR, real file validation, auth/RBAC,
permission middleware, pet-document logic, and unrelated refactors.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js runtime, ES2022 target,
NodeNext module resolution. No explicit Node engine is declared in
`package.json`.

**Primary Dependencies**: `packages/api` uses Fastify 5.8.5, Prisma 6.19.3,
PostgreSQL, Zod 4.4.3, Vitest 4.1.9, and existing shared domain/application
helpers. The implementation reuses the existing `UnitOfWork` port,
`PrismaTransactionManager`, `ConflictError`, `NotFoundError`,
`DomainValidationError`, `OrganizationRepository`, `PatientRepository`, and
`UserRepository` where appropriate.

**Storage**: PostgreSQL through Prisma. A Prisma migration is required to add
`OrganizationRequiredDocument`, `OrganizationDocumentPatientApproval`,
`OrganizationDocumentApprovalLog`, and `DocumentApprovalStatus`. Relations should
be added to existing `Organization`, `Patient`, and `User` models where they
match the current schema patterns.

**Testing**: Vitest unit tests for domain entities, use cases, and Zod schemas.
Repository behavior is covered through mapper/repository unit tests when
practical; route behavior can be covered with schema tests and quickstart manual
API scenarios unless an existing `buildApp().inject()` route-test pattern is
introduced in tasks. Package gates are `pnpm test:api`, `pnpm typecheck:api`,
`pnpm build:api`, `pnpm prisma:generate`, and `pnpm prisma:migrate` when a
database is available.

**Target Platform**: Fastify API runtime only.

**Project Type**: pnpm monorepo. API-only source changes under `packages/api`
plus feature documentation under `specs/008-backend-document-approvals`.

**Performance Goals**: 95% of valid backend operations in this feature should
complete in under 2 seconds in a normal development or staging environment.
List operations should order by creation time and remain bounded to the route
organization/patient scope.

**Constraints**: Do not alter `packages/web`. Do not implement upload, storage,
cloud integrations, presigned URLs, download, file preview, OCR, real file
validation, authentication, RBAC, authorization middleware, pet document logic,
notifications, email, visual timeline, or electronic signature. Do not import
Prisma into domain or application code. Do not import Fastify or Zod outside the
presentation boundary.

**Scale/Scope**: One backend module, two domain workflow areas, three new
persistence models, one enum, ten use cases, one route plugin, one app
registration, one OpenAPI contract, and focused tests. No frontend package
changes and no storage service.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: PASS. Implementation is limited to `packages/api`
  and feature documentation. `packages/web` remains untouched. `packages/shared`
  is not changed because these contracts are backend-only today and no shared
  package consumer is planned in this slice.
- **Shared Contracts**: PASS. API payloads, response shapes, approval status
  values, audit action values, and errors are documented in
  `contracts/organization-documents.openapi.yaml`. Domain enums stay in
  `packages/api` unless a later frontend/shared consumer requires promotion.
- **Tenant Isolation**: PASS. Every route is scoped by `organizationId`.
  Required document queries filter by `organizationId`; approval commands verify
  both `documentId` and `patientId` belong to the route organization; log reads
  are reached only through an approval that belongs to the same organization and
  patient.
- **Clean Layering**: PASS. Domain entities enforce status/name/reason
  invariants. Use cases depend on repository interfaces and `UnitOfWork`.
  Prisma repositories and mappers stay in infrastructure. Zod/Fastify stay in
  `presentation/http`. Prisma schema changes stay in `packages/api/prisma`.
- **Verifiable Delivery**: PASS. User stories are independently testable:
  required-document CRUD, patient approval creation/listing, and approval
  transitions with append-only logs. Verification covers domain invariants,
  duplicate conflicts, tenant isolation, structured errors, transactionality,
  migration generation, and absence of frontend/upload/storage changes.

## Project Structure

### Documentation (this feature)

```text
specs/008-backend-document-approvals/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── organization-documents.openapi.yaml
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
packages/
└── api/
    ├── package.json
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    │       └── <timestamp>_organization_document_approvals/
    │           └── migration.sql
    └── src/
        ├── modules/
        │   ├── organization-documents/
        │   │   ├── application/
        │   │   │   ├── repositories/
        │   │   │   │   ├── OrganizationDocumentApprovalLogRepository.ts
        │   │   │   │   ├── OrganizationDocumentPatientApprovalRepository.ts
        │   │   │   │   └── OrganizationRequiredDocumentRepository.ts
        │   │   │   └── use-cases/
        │   │   │       ├── ApprovePatientDocumentUseCase.ts
        │   │   │       ├── ApprovePatientDocumentUseCase.test.ts
        │   │   │       ├── CreateOrganizationRequiredDocumentUseCase.ts
        │   │   │       ├── CreateOrganizationRequiredDocumentUseCase.test.ts
        │   │   │       ├── CreatePatientDocumentApprovalUseCase.ts
        │   │   │       ├── CreatePatientDocumentApprovalUseCase.test.ts
        │   │   │       ├── DeleteOrganizationRequiredDocumentUseCase.ts
        │   │   │       ├── DeleteOrganizationRequiredDocumentUseCase.test.ts
        │   │   │       ├── ListOrganizationRequiredDocumentsUseCase.ts
        │   │   │       ├── ListPatientDocumentApprovalLogsUseCase.ts
        │   │   │       ├── ListPatientDocumentApprovalsUseCase.ts
        │   │   │       ├── RejectPatientDocumentUseCase.ts
        │   │   │       ├── RejectPatientDocumentUseCase.test.ts
        │   │   │       ├── ResetPatientDocumentToPendingUseCase.ts
        │   │   │       ├── ResetPatientDocumentToPendingUseCase.test.ts
        │   │   │       └── UpdateOrganizationRequiredDocumentUseCase.ts
        │   │   ├── domain/
        │   │   │   ├── entities/
        │   │   │   │   ├── OrganizationDocumentApprovalLog.ts
        │   │   │   │   ├── OrganizationDocumentPatientApproval.ts
        │   │   │   │   ├── OrganizationDocumentPatientApproval.test.ts
        │   │   │   │   ├── OrganizationRequiredDocument.ts
        │   │   │   │   └── OrganizationRequiredDocument.test.ts
        │   │   │   └── enums/
        │   │   │       ├── DocumentApprovalAction.ts
        │   │   │       └── DocumentApprovalStatus.ts
        │   │   ├── infrastructure/
        │   │   │   ├── create-organization-document-use-cases.factory.ts
        │   │   │   └── prisma/
        │   │   │       ├── OrganizationDocumentApprovalLogMapper.ts
        │   │   │       ├── OrganizationDocumentPatientApprovalMapper.ts
        │   │   │       ├── OrganizationRequiredDocumentMapper.ts
        │   │   │       ├── PrismaOrganizationDocumentApprovalLogRepository.ts
        │   │   │       ├── PrismaOrganizationDocumentPatientApprovalRepository.ts
        │   │   │       └── PrismaOrganizationRequiredDocumentRepository.ts
        │   │   └── presentation/http/
        │   │       ├── organization-document-presenter.ts
        │   │       ├── organization-document-routes.ts
        │   │       ├── organization-document-schemas.test.ts
        │   │       └── organization-document-schemas.ts
        │   ├── organizations/
        │   ├── patients/
        │   └── users/
        └── shared/
            ├── application/
            │   ├── errors/
            │   └── transaction/UnitOfWork.ts
            ├── domain/
            │   └── entities/
            ├── infrastructure/database/prisma/
            │   └── PrismaTransactionManager.ts
            └── presentation/http/fastify/
                └── app.ts
```

**Structure Decision**: Add a new `modules/organization-documents` module rather
than placing the slice inside `organizations` or `patients`. The feature owns a
document-approval workflow that references both organization and patient data,
and the current codebase organizes bounded backend features as modules with
their own domain/application/infrastructure/presentation folders.

## Current Architecture Analysis

- **Domain modules**: Domain code lives under
  `packages/api/src/modules/<module>/domain`. Entities extend shared
  `Entity` or `AggregateRoot`, and throw `DomainValidationError` for invariant
  violations. Examples: `Organization`, `Patient`, `SubscriptionPlan`.
- **Use cases**: Use cases live under
  `packages/api/src/modules/<module>/application/use-cases`. They accept
  dependencies through constructors and return DTO/read-model outputs.
- **Repositories**: Repository interfaces live under
  `packages/api/src/modules/<module>/application/repositories`; concrete Prisma
  repositories live under `infrastructure/prisma`.
- **Prisma mappers**: Mappers live next to Prisma repositories, for example
  `OrganizationMapper`, `PatientMapper`, `SubscriptionPlanMapper`, and convert
  between Prisma records, domain entities, persistence input, and read models.
- **Fastify handlers/routes**: Route plugins live under
  `packages/api/src/modules/<module>/presentation/http/*-routes.ts`. They build
  use cases through module factories, parse params/body/query with Zod
  `safeParse`, return local 400 validation errors, and rely on the global error
  handler for application/domain errors.
- **Error handling**: The global Fastify error handler maps Fastify validation
  errors to 400, `DomainValidationError` to 422, other `DomainError` to 400,
  `NotFoundError` to 404, `ConflictError` to 409, `AuthenticationError` to 401,
  and unexpected 5xx errors to `{ error: "InternalServerError", message:
  "Internal Server Error" }`.
- **Zod usage**: Zod schemas live in presentation schema files. Current patterns
  use strict object schemas, transforms for normalization at the HTTP boundary,
  JSON schemas for Fastify docs/validation, and exported inferred types.
- **Organization model**: `Organization` is an aggregate root with `slug`,
  `tradeName`, `legalName`, `cnpj`, `primaryCnae`, `secondaryCnaes`,
  `currentPlanId`, and `addressId`. Prisma `Organization` has relations to
  `SubscriptionPlan`, `Address`, `OrganizationSettings`, and
  `OrganizationEmployee`.
- **Patient model**: `Patient` is an aggregate root with `organizationId`,
  optional `guardianId`, `name`, normalized document, `birthdate`, `gender`, and
  `underPrivileged`. Prisma currently has `@@unique([organizationId,
  document])`.
- **User model**: `User` is an entity for authentication/authorization data
  with `organizationId`, normalized `email`, `passwordHash`, `profile`,
  optional `guardianId`, optional `patientId`, and optional
  `organizationEmployeeId`. Organization users are represented by
  `UserProfile.Organization` and link to `OrganizationEmployee`.
- **Logs/auditoria**: No persistent audit-log module exists. Shared
  `AggregateRoot` supports in-memory `DomainEvent` buffering, but no dispatcher
  or persisted audit-log pattern is implemented. This feature should use an
  explicit audit entity and repository.
- **UnitOfWork/transação**: `UnitOfWork` exists in shared application and is
  implemented by `PrismaTransactionManager` using `AsyncLocalStorage`.
  Repositories receive `TransactionalPrisma` and automatically share the active
  transaction client inside `unitOfWork.execute`.

## Target Architecture

### Parte A - Required Documents

1. **Domain**: Add `OrganizationRequiredDocument` as an entity with
   `organizationId`, `name`, and name normalization/invariant checks. It is not
   an uploaded-file entity and has no file metadata.
2. **Repository interface**: Add `OrganizationRequiredDocumentRepository` with
   methods to find by ID in organization, find duplicate name in organization,
   list by organization, create, save, delete, and check `hasApprovals`.
3. **Prisma mapper/repository**: Add mapper and Prisma repository using the
   new `organizationRequiredDocument` Prisma model. List operations order by
   `createdAt` ascending. Duplicate checks use `organizationId + name`.
4. **Use cases**: Add create/list/update/delete use cases. Create/update check
   organization existence through `OrganizationRepository`, enforce duplicate
   name conflicts, and return read models. Delete checks same-organization
   existence and blocks removal when approvals exist.
5. **Fastify routes**: Add routes under
   `/organizations/:organizationId/required-documents`, using Zod params/body
   schemas and structured responses. Do not add auth/RBAC middleware.
6. **Tests**: Domain tests for required name and organization ID. Use-case tests
   for create/list/update/delete, duplicate names, organization not found,
   document not found, document in use, and cross-organization isolation.
   Schema tests for params/body validation.

### Parte B - Patient Document Approvals

1. **Domain**: Add `OrganizationDocumentPatientApproval` as aggregate root with
   `documentId`, `patientId`, `status`, and `rejectedReason`. It exposes
   transition methods `approve`, `reject`, and `resetToPending` that enforce
   `rejectedReason` invariants and return/record the audit action to persist.
2. **Enum**: Add `DocumentApprovalStatus` with `Pending = "PENDING"`,
   `Rejected = "REJECTED"`, and `Approved = "APPROVED"`.
3. **Audit domain**: Add `OrganizationDocumentApprovalLog` entity and
   `DocumentApprovalAction` enum with `CREATED_PATIENT_DOCUMENT_APPROVAL`,
   `APPROVED_DOCUMENT`, `REJECTED_DOCUMENT`, and
   `RESET_DOCUMENT_TO_PENDING`. Creation action is defined for forward
   compatibility, but this feature only requires logs for approve/reject/reset
   because the create approval payload does not include `organizationUserId`.
4. **Repository interfaces**: Add
   `OrganizationDocumentPatientApprovalRepository` for finding by ID scoped
   through document/patient organization checks, finding by `documentId +
   patientId`, listing by patient, creating, and saving. Add
   `OrganizationDocumentApprovalLogRepository` for create and list by approval.
5. **Prisma mapper/repository**: Add mappers and Prisma repositories for
   approval and log models. Approval list queries include/filter through
   required document organization and patient ID. Log list queries are reached
   only after approval ownership is verified.
6. **Use cases**: Add create/list/approve/reject/reset/logs use cases. Create
   verifies organization, patient, and document ownership; prevents duplicate
   approval; and creates `PENDING`. Approve/reject/reset run in `UnitOfWork` to
   save status changes and append exactly one log atomically. Logs are listed
   append-only by creation time.
7. **Fastify routes**: Add approval routes under
   `/organizations/:organizationId/patients/:patientId/document-approvals`.
   Use Zod for params/body, include schemas for approve/reject/reset/logs, and
   register the route plugin in `buildApp()`.
8. **Tests**: Domain tests for status transitions and rejection reason rules.
   Use-case tests for create/list/approve/reject/reset/logs, duplicate
   approvals, patient/document organization mismatch, missing rejection reason,
   log append behavior, and transaction usage. Schema tests for route params and
   request bodies.

## Files To Create

- `packages/api/src/modules/organization-documents/domain/entities/OrganizationRequiredDocument.ts`
- `packages/api/src/modules/organization-documents/domain/entities/OrganizationRequiredDocument.test.ts`
- `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.ts`
- `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentPatientApproval.test.ts`
- `packages/api/src/modules/organization-documents/domain/entities/OrganizationDocumentApprovalLog.ts`
- `packages/api/src/modules/organization-documents/domain/enums/DocumentApprovalStatus.ts`
- `packages/api/src/modules/organization-documents/domain/enums/DocumentApprovalAction.ts`
- `packages/api/src/modules/organization-documents/application/repositories/OrganizationRequiredDocumentRepository.ts`
- `packages/api/src/modules/organization-documents/application/repositories/OrganizationDocumentPatientApprovalRepository.ts`
- `packages/api/src/modules/organization-documents/application/repositories/OrganizationDocumentApprovalLogRepository.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/CreateOrganizationRequiredDocumentUseCase.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/ListOrganizationRequiredDocumentsUseCase.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/UpdateOrganizationRequiredDocumentUseCase.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/DeleteOrganizationRequiredDocumentUseCase.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/CreatePatientDocumentApprovalUseCase.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalsUseCase.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/ApprovePatientDocumentUseCase.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/RejectPatientDocumentUseCase.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/ResetPatientDocumentToPendingUseCase.ts`
- `packages/api/src/modules/organization-documents/application/use-cases/ListPatientDocumentApprovalLogsUseCase.ts`
- Corresponding `*.test.ts` files for high-risk use cases.
- `packages/api/src/modules/organization-documents/infrastructure/create-organization-document-use-cases.factory.ts`
- `packages/api/src/modules/organization-documents/infrastructure/prisma/OrganizationRequiredDocumentMapper.ts`
- `packages/api/src/modules/organization-documents/infrastructure/prisma/OrganizationDocumentPatientApprovalMapper.ts`
- `packages/api/src/modules/organization-documents/infrastructure/prisma/OrganizationDocumentApprovalLogMapper.ts`
- `packages/api/src/modules/organization-documents/infrastructure/prisma/PrismaOrganizationRequiredDocumentRepository.ts`
- `packages/api/src/modules/organization-documents/infrastructure/prisma/PrismaOrganizationDocumentPatientApprovalRepository.ts`
- `packages/api/src/modules/organization-documents/infrastructure/prisma/PrismaOrganizationDocumentApprovalLogRepository.ts`
- `packages/api/src/modules/organization-documents/presentation/http/organization-document-presenter.ts`
- `packages/api/src/modules/organization-documents/presentation/http/organization-document-routes.ts`
- `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.ts`
- `packages/api/src/modules/organization-documents/presentation/http/organization-document-schemas.test.ts`
- `packages/api/prisma/migrations/<timestamp>_organization_document_approvals/migration.sql`

## Files To Modify

- `packages/api/prisma/schema.prisma`: add the three models, the
  `DocumentApprovalStatus` enum, and relations to `Organization`, `Patient`,
  and optionally `User`/`OrganizationEmployee` if the current relation pattern
  supports `organizationUserId`.
- `packages/api/src/modules/patients/application/repositories/PatientRepository.ts`:
  add `findByIdInOrganization(organizationId, patientId)` or equivalent for
  tenant validation.
- `packages/api/src/modules/patients/infrastructure/prisma/PrismaPatientRepository.ts`:
  implement the scoped patient lookup.
- `packages/api/src/shared/presentation/http/fastify/app.ts`: register
  `organizationDocumentRoutes`.
- Potentially `packages/api/src/modules/users/application/repositories/UserRepository.ts`
  and `PrismaUserRepository.ts`: only if implementation chooses to validate
  that `organizationUserId` exists in the same organization. The spec does not
  require real permission validation.

## Migration Plan

Migration is required.

Add Prisma models equivalent to:

- `OrganizationRequiredDocument` mapped to `organization_required_documents`
  with `@@unique([organizationId, name])`.
- `OrganizationDocumentPatientApproval` mapped to
  `organization_document_patient_approvals` with `@@unique([documentId,
  patientId])` and `status DocumentApprovalStatus @default(PENDING)`.
- `OrganizationDocumentApprovalLog` mapped to
  `organization_document_approval_logs`.
- `DocumentApprovalStatus` enum with `PENDING`, `REJECTED`, `APPROVED`.

Add relations:

- `Organization.requiredDocuments`.
- `Patient.documentApprovals`.
- `OrganizationRequiredDocument.approvals`.
- `OrganizationDocumentPatientApproval.document`, `.patient`, and `.logs`.
- Optional `User` or `OrganizationEmployee` relation for `organizationUserId`
  only if the current model can represent the actor without adding auth/RBAC
  semantics. Otherwise persist `organizationUserId` as a scalar string per spec.

## Risks

- **Actor ambiguity**: `organizationUserId` could mean `User.id` or
  `OrganizationEmployee.id`. The implementation should document the chosen
  interpretation in tasks; safest first pass is scalar storage plus optional
  same-organization existence validation only if a repository already supports
  it.
- **Case-sensitive duplicate names**: The spec requires name uniqueness inside
  an organization but does not define case sensitivity. Plan default is trimmed
  exact string uniqueness; tasks may add normalization if product wants
  case-insensitive uniqueness.
- **Log atomicity**: Approve/reject/reset must save status and append a log
  together. Use `UnitOfWork`; direct sequential writes outside a transaction are
  not acceptable for these commands.
- **Cross-tenant leakage**: Approval and log routes are nested under
  organization and patient IDs; repositories must not use approval ID alone for
  commands without verifying document and patient ownership.
- **Deletion safety**: Required-document deletion must count approvals before
  deletion and should rely on both application checks and relational constraints.
- **No existing audit pattern**: This is the first persisted audit log slice.
  Keep it local to the module and append-only; do not introduce global audit
  infrastructure in this feature.

## Implementation Order

1. Update Prisma schema and create the migration for the three models and enum.
2. Generate Prisma client.
3. Add domain enums/entities and domain tests.
4. Extend `PatientRepository` with scoped patient lookup.
5. Add repository interfaces for required documents, approvals, and logs.
6. Add Prisma mappers and repositories.
7. Implement Required Documents use cases and tests.
8. Implement Patient Document Approvals use cases and tests, using
   `UnitOfWork` for approve/reject/reset.
9. Add presentation schemas, presenter, and routes.
10. Register routes in `buildApp()`.
11. Add/update schema tests and route documentation.
12. Run validation commands and quickstart API scenarios.

## Rollback Strategy

- Roll back route exposure by removing `organizationDocumentRoutes`
  registration from `buildApp()`.
- Roll back source behavior by removing the `organization-documents` module and
  any added patient/user repository methods.
- Roll back persistence by reverting the Prisma migration and removing the
  three models, enum, and relations from `schema.prisma` before regenerating the
  Prisma client.
- Because the feature has no frontend, upload, or storage integration, rollback
  has no external-file cleanup and no cloud resource cleanup.
- If production data exists in the new tables, export or archive
  `organization_required_documents`, `organization_document_patient_approvals`,
  and `organization_document_approval_logs` before dropping them.

## Validation Commands

```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm test:api
pnpm typecheck:api
pnpm build:api
pnpm typecheck
pnpm build
```

Manual/API validation is documented in [quickstart.md](./quickstart.md).

## Complexity Tracking

No constitution violations identified.

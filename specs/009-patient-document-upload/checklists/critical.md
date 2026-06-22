# Critical Pre-Implementation Checklist: Upload Backend de Documentos do Paciente

**Purpose**: Validate the approved requirements, plan, and tasks before implementation.
**Created**: 2026-06-22
**Feature**: [spec.md](../spec.md)

## Scope Boundaries

- [x] CHK001 Is the feature explicitly scoped as backend-only? [Completeness, Spec §Scope]
- [x] CHK002 Is frontend/UI work explicitly excluded from this feature? [Completeness, Spec §Out of Scope]
- [x] CHK003 Is Cloudflare R2 constrained to infrastructure, with no storage SDK dependency in domain/application business rules? [Consistency, Plan §Target Architecture]
- [x] CHK004 Is the domain requirement clear that it must not depend on R2, SDKs, Fastify, Prisma, Zod, HTTP, or multipart parsing? [Clarity, Plan §Constraints]
- [x] CHK005 Is the application dependency constrained to the `DocumentStorageService` interface rather than a concrete storage implementation? [Consistency, Spec §Storage Port]

## Persistence And URLs

- [x] CHK006 Is persistence limited to `storageKey` and metadata, with final fixed URLs explicitly excluded from the database? [Completeness, Spec §Data Model]
- [x] CHK007 Is GET/listing behavior required to generate `fileUrl` dynamically at read time? [Completeness, Spec §GET de documentos]
- [x] CHK008 Is the null behavior specified for `fileUrl` when `storageKey` is absent? [Clarity, Spec §GET de documentos]
- [x] CHK009 Are upload metadata fields `fileName`, `mimeType`, `size`, and `storageKey` all required to be updated on successful upload? [Completeness, Spec §Campos novos]

## Workflow And Audit

- [x] CHK010 Is upload/reupload required to move approval status back to `PENDING`? [Completeness, Spec §Endpoint de upload]
- [x] CHK011 Is upload/reupload required to clear `rejectedReason`? [Completeness, Spec §Endpoint de upload]
- [x] CHK012 Is upload/reupload required to append an audit log action? [Completeness, Spec §Logs]
- [x] CHK013 Is approval scoping by both route `organizationId` and route `patientId` required before upload? [Clarity, Spec §Endpoint de upload]

## Upload Validation And Security

- [x] CHK014 Is the file itself required for upload requests? [Completeness, Spec §Validações]
- [x] CHK015 Is maximum file size validation specified and configurable? [Completeness, Spec §Validações]
- [x] CHK016 Is MIME type validation specified with an allowed set? [Completeness, Spec §Validações]
- [x] CHK017 Is it specified that R2 credentials must never appear in responses? [Security, Spec §GET de documentos]

## Delivery Readiness

- [x] CHK018 Is a Prisma migration planned for the new approval metadata fields? [Completeness, Plan §Migration need]
- [x] CHK019 Is old-file deletion explicitly out of scope or deferred as future cleanup? [Clarity, Spec §Fora de escopo]
- [x] CHK020 Are tasks small, layer-separated, and non-overlapping across domain, application, infrastructure, presentation, and tests? [Consistency, Tasks §Phases]
- [x] CHK021 Is a rollback strategy defined for migration/code/dependency changes? [Completeness, Plan §Rollback Strategy]
- [x] CHK022 Are minimum tests planned for domain behavior, upload use case, URL listing, validation, and storage adapter boundaries? [Completeness, Tasks §Tests]

## Classification

**Pode implementar agora**


# Research: Upload Backend de Documentos do Paciente

## Decision: Extend the Existing `organization-documents` Module

**Rationale**: Upload belongs to the patient document approval workflow that is
already modeled in `modules/organization-documents`. Keeping upload in the same
bounded module avoids splitting approval state, metadata, logs, and routes
across unrelated modules.

**Alternatives considered**:

- Create a generic `documents` or `storage` module. Rejected because this slice
  has one domain-specific upload workflow and no broader storage product surface.
- Add upload under `patients`. Rejected because approvals and logs already live
  in `organization-documents`.

## Decision: Add File Metadata to `OrganizationDocumentPatientApproval`

**Rationale**: The feature supports exactly one file per approval. Storing
nullable metadata and `storageKey` on the existing approval record keeps reads
simple and preserves the invariant that one approval has one current uploaded
file.

**Alternatives considered**:

- Add a separate document-file table. Rejected because versioning, multiple
  files, and history are explicitly out of scope.
- Store only `storageKey`. Rejected because list responses need original name,
  MIME type, and size.

## Decision: Use a Module-Local `DocumentStorageService` Port

**Rationale**: No storage abstraction exists today. A module-local application
port lets use cases depend on `upload` and `getDownloadUrl` without importing
R2, S3 SDKs, HTTP, or infrastructure details.

**Alternatives considered**:

- Use R2 SDK directly in use cases. Rejected because application must not depend
  on infrastructure.
- Build a global storage framework. Rejected as broader than the feature.

## Decision: Implement Cloudflare R2 Through S3-Compatible SDK Infrastructure

**Rationale**: Cloudflare R2 exposes an S3-compatible object API. The
infrastructure adapter can upload objects and generate signed GET URLs while
keeping credentials and bucket details outside domain/application code.

**Alternatives considered**:

- Public bucket URL with fixed saved URL. Rejected because the spec forbids
  saving final URLs and requires read-time URL generation.
- Presigned POST/direct browser upload. Rejected because direct browser upload
  and presigned POST are out of scope.

## Decision: Add Fastify Multipart Support as a Shared Plugin

**Rationale**: The API currently has no multipart parser and no upload route
pattern. Registering a Fastify multipart plugin before routes keeps multipart
configuration centralized and lets the upload route read a single file.

**Alternatives considered**:

- Parse multipart manually in the route. Rejected because it is error-prone and
  duplicates framework responsibility.
- Accept base64 JSON payloads. Rejected because the spec requires
  `multipart/form-data`.

## Decision: Generate Storage Keys in the Use Case

**Rationale**: The backend must control `storageKey`. Including organization,
patient, approval, timestamp, and safe filename makes keys traceable and avoids
accidental overwrite during reupload.

**Alternatives considered**:

- Accept key from client. Rejected because callers could overwrite or escape
  expected paths.
- Use random UUID only. Rejected because it loses operational traceability.

## Decision: Upload First, Then Persist Metadata and Log in UnitOfWork

**Rationale**: The database needs a successful storage result to persist
`storageKey`. Approval metadata save and audit log append should remain atomic
inside `UnitOfWork`, matching existing approve/reject/reset behavior.

**Alternatives considered**:

- Persist pending metadata before upload. Rejected because failed uploads would
  leave metadata pointing to nothing.
- Delete R2 object automatically on DB failure. Deferred because old-file and
  cleanup behavior is explicitly out of scope and must be designed safely.

## Decision: Generate File URLs in Application Read Use Cases

**Rationale**: `fileUrl` is not persisted and must be generated when approvals
are read. Adding storage URL generation to list/read use cases keeps routes
thin and lets tests use a fake storage service.

**Alternatives considered**:

- Generate URLs in presenter. Rejected because presenter should be synchronous
  formatting and not call infrastructure.
- Store URLs in database. Rejected by spec.

## Decision: Use Existing Log Entity With New Action

**Rationale**: Approval logs already exist as append-only records. Adding
`UPLOADED_DOCUMENT` to the existing action enum keeps upload audit local and
consistent with approve/reject/reset.

**Alternatives considered**:

- Add separate upload log table. Rejected because approval logs already model
  workflow audit.
- Reuse `RESET_DOCUMENT_TO_PENDING`. Rejected because upload/reupload is a
  distinct auditable action.

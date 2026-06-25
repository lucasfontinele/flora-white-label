# Data Model: Upload Backend de Documentos do Paciente

## Entity: OrganizationDocumentPatientApproval

Existing aggregate root for one required document approval for one patient.
This feature extends it with current-file metadata.

### Existing Fields

- `id`: string UUID, required.
- `organizationId`: string UUID, required tenant key.
- `documentId`: required document ID.
- `patientId`: patient ID.
- `status`: `PENDING`, `REJECTED`, or `APPROVED`.
- `rejectedReason`: string or null.
- `createdAt`: datetime.
- `updatedAt`: datetime.

### New Fields

- `fileName`: string or null. Original uploaded filename after safe metadata
  normalization.
- `mimeType`: string or null. Validated MIME type.
- `size`: integer or null. File size in bytes.
- `storageKey`: string or null. Backend-generated Cloudflare R2 object key.

### Relationships

- Belongs to one `Organization`.
- Belongs to one `OrganizationRequiredDocument`.
- Belongs to one `Patient`.
- Has many `OrganizationDocumentApprovalLog` records.

### Validation Rules

- `fileName`, `mimeType`, `size`, and `storageKey` are all null before upload.
- Uploaded file metadata requires non-empty `fileName`, non-empty allowed
  `mimeType`, `size > 0`, and non-empty `storageKey`.
- Successful upload or reupload sets `status` to `PENDING`.
- Successful upload or reupload sets `rejectedReason` to null.
- Status/rejectedReason invariants from the existing approval workflow remain
  valid.
- No final URL is stored.

### State Transition: Upload/Reupload

| Current State | Action | New State | Rejected Reason | Metadata | Log Action |
|---------------|--------|-----------|-----------------|----------|------------|
| `PENDING` | upload | `PENDING` | `null` | replaced | `UPLOADED_DOCUMENT` |
| `REJECTED` | upload | `PENDING` | `null` | replaced | `UPLOADED_DOCUMENT` |
| `APPROVED` | upload | `PENDING` | `null` | replaced | `UPLOADED_DOCUMENT` |

## Entity: OrganizationDocumentApprovalLog

Existing append-only audit record for approval workflow actions.

### Change

Add allowed action:

- `UPLOADED_DOCUMENT`: file was uploaded or reuploaded for an approval.

### Actor

The current log model requires `organizationUserId`. This feature may keep that
field as the actor identifier name for compatibility or plan a backward
compatible optional actor naming adjustment. It must not introduce new auth or
RBAC.

## Application Port: DocumentStorageService

Application-level capability for storing document files and generating access
URLs.

### UploadDocumentInput

- `storageKey`: backend-generated object key.
- `fileName`: original filename.
- `mimeType`: validated MIME type.
- `size`: file size in bytes.
- `content`: file stream, bytes, or implementation-appropriate body type passed
  from presentation/application without exposing infrastructure to domain.

### UploadDocumentOutput

- `storageKey`: final object key that should be persisted.
- `size`: stored byte size.
- `mimeType`: stored MIME type.

### Operations

- `upload(input)`
- `getDownloadUrl(storageKey)`

## Read Model: PatientDocumentApprovalWithFileUrl

Approval response read model extended for API responses.

### Fields

- `id`
- `organizationId`
- `documentId`
- `patientId`
- `status`
- `rejectedReason`
- `fileName`
- `mimeType`
- `size`
- `storageKey`
- `fileUrl`
- `createdAt`
- `updatedAt`

### Rules

- `fileUrl` is null when `storageKey` is null.
- `fileUrl` is generated at read time when `storageKey` exists.
- `fileUrl` must not expose credentials, bucket name, access key, secret, or
  account identifiers.

## Prisma Persistence Design

Add nullable fields to the existing Prisma model:

```prisma
model OrganizationDocumentPatientApproval {
  id             String                 @id @default(uuid())
  organizationId String
  documentId     String
  patientId      String
  status         DocumentApprovalStatus @default(PENDING)
  rejectedReason String?
  fileName       String?
  mimeType       String?
  size           Int?
  storageKey     String?
  createdAt      DateTime               @default(now())
  updatedAt      DateTime               @updatedAt

  organization Organization                      @relation(fields: [organizationId], references: [id])
  document     OrganizationRequiredDocument      @relation(fields: [documentId], references: [id])
  patient      Patient                           @relation(fields: [patientId], references: [id])
  logs         OrganizationDocumentApprovalLog[]

  @@unique([documentId, patientId])
  @@map("organization_document_patient_approvals")
}
```

## Configuration Data

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PRESIGNED_URL_EXPIRES_IN`
- `MAX_DOCUMENT_UPLOAD_SIZE_BYTES`
- optional `DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES`

`R2_PUBLIC_BASE_URL` is not required when signed GET URLs are used.

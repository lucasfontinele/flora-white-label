# Data Model: Backend de Documentos Obrigatórios e Aprovações

## Entity: OrganizationRequiredDocument

Represents a document type/configuration required by an organization. It does
not represent an uploaded file.

### Fields

- `id`: string UUID, required.
- `organizationId`: string UUID, required tenant key.
- `name`: string, required, trimmed.
- `createdAt`: datetime, persistence/read model.
- `updatedAt`: datetime, persistence/read model.

### Relationships

- Belongs to one `Organization`.
- Has many `OrganizationDocumentPatientApproval` records.

### Validation Rules

- `organizationId` must be present and non-empty.
- `name` must be present and non-empty after trimming external whitespace.
- `name` must be unique within the same `organizationId`.
- Same `name` is allowed in different organizations.
- Deletion is allowed only when no approvals reference the document.

### Repository Operations

- `findByIdInOrganization(organizationId, documentId)`
- `findByNameInOrganization(organizationId, name)`
- `findByNameInOrganizationExcludingId(organizationId, name, documentId)`
- `findAllByOrganization(organizationId)`
- `create(document)`
- `save(document)`
- `delete(documentId)`
- `hasApprovals(documentId)`

## Entity: OrganizationDocumentPatientApproval

Aggregate root for the approval state of one required document for one patient.

### Fields

- `id`: string UUID, required.
- `documentId`: string UUID, required.
- `patientId`: string UUID, required.
- `status`: `DocumentApprovalStatus`, required, defaults to `PENDING`.
- `rejectedReason`: string or null.
- `createdAt`: datetime, persistence/read model.
- `updatedAt`: datetime, persistence/read model.

### Relationships

- Belongs to one `OrganizationRequiredDocument`.
- Belongs to one `Patient`.
- Has many `OrganizationDocumentApprovalLog` records.

### Validation Rules

- `documentId` must be present and non-empty.
- `patientId` must be present and non-empty.
- There must be at most one approval for `documentId + patientId`.
- Initial status is `PENDING`.
- `PENDING` requires `rejectedReason` to be null.
- `APPROVED` requires `rejectedReason` to be null.
- `REJECTED` requires non-empty `rejectedReason`.
- Approval commands must verify that document and patient belong to the route
  organization before changing state.

### State Transitions

| Current State | Action | New State | Rejected Reason | Log Action |
|---------------|--------|-----------|-----------------|------------|
| `PENDING` | approve | `APPROVED` | `null` | `APPROVED_DOCUMENT` |
| `REJECTED` | approve | `APPROVED` | `null` | `APPROVED_DOCUMENT` |
| `APPROVED` | approve | `APPROVED` | `null` | `APPROVED_DOCUMENT` |
| `PENDING` | reject | `REJECTED` | required text | `REJECTED_DOCUMENT` |
| `APPROVED` | reject | `REJECTED` | required text | `REJECTED_DOCUMENT` |
| `REJECTED` | reject | `REJECTED` | required text | `REJECTED_DOCUMENT` |
| `PENDING` | reset | `PENDING` | `null` | `RESET_DOCUMENT_TO_PENDING` |
| `REJECTED` | reset | `PENDING` | `null` | `RESET_DOCUMENT_TO_PENDING` |
| `APPROVED` | reset | `PENDING` | `null` | `RESET_DOCUMENT_TO_PENDING` |

The feature does not require blocking idempotent transitions. If tasks later
choose to reject no-op transitions, they must document that as an invalid status
transition and cover it with tests.

### Repository Operations

- `findByIdForPatientInOrganization(organizationId, patientId, approvalId)`
- `findByDocumentAndPatient(documentId, patientId)`
- `findAllByPatientInOrganization(organizationId, patientId)`
- `create(approval)`
- `save(approval)`

## Enum: DocumentApprovalStatus

- `PENDING`: approval is waiting for review or future resubmission.
- `REJECTED`: approval was rejected and must carry `rejectedReason`.
- `APPROVED`: approval was approved and must not carry `rejectedReason`.

## Entity: OrganizationDocumentApprovalLog

Append-only audit record for approval workflow actions.

### Fields

- `id`: string UUID, required.
- `action`: `DocumentApprovalAction` persisted as string.
- `patientApprovalId`: string UUID, required.
- `organizationUserId`: string UUID or string identifier, required.
- `createdAt`: datetime, persistence/read model.

### Relationships

- Belongs to one `OrganizationDocumentPatientApproval`.

### Validation Rules

- `action` must be one of the allowed audit actions.
- `patientApprovalId` must be present and non-empty.
- `organizationUserId` must be present and non-empty for approve/reject/reset.
- Logs are append-only; no update/delete use cases or repository methods should
  be exposed.

### Repository Operations

- `create(log)`
- `findAllByPatientApproval(patientApprovalId)`

## Enum: DocumentApprovalAction

- `CREATED_PATIENT_DOCUMENT_APPROVAL`: defined for future/context-driven
  creation auditing.
- `APPROVED_DOCUMENT`: approval was approved.
- `REJECTED_DOCUMENT`: approval was rejected.
- `RESET_DOCUMENT_TO_PENDING`: approval was reset to pending to represent
  future resubmission behavior.

## Existing Entity Dependencies

### Organization

Current aggregate root for tenant registration. Required documents use
`Organization.id` as tenant key and should add a Prisma relation from
`Organization` to `OrganizationRequiredDocument`.

### Patient

Current aggregate root with `organizationId`. Approval creation and all approval
commands must verify the patient belongs to the route organization. Add a
repository method for scoped patient lookup if implementation does not already
have one.

### User / Organization User

Current `User` entity has `organizationId`, `profile`, and optional
`organizationEmployeeId`. This feature uses `organizationUserId` as the audit
actor string for approve/reject/reset. It does not add RBAC or permission
middleware.

## Prisma Persistence Design

```prisma
model OrganizationRequiredDocument {
  id             String   @id @default(uuid())
  organizationId String
  name           String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization @relation(fields: [organizationId], references: [id])
  approvals      OrganizationDocumentPatientApproval[]

  @@unique([organizationId, name])
  @@map("organization_required_documents")
}

model OrganizationDocumentPatientApproval {
  id             String                 @id @default(uuid())
  documentId     String
  patientId      String
  status         DocumentApprovalStatus @default(PENDING)
  rejectedReason String?
  createdAt      DateTime               @default(now())
  updatedAt      DateTime               @updatedAt

  document       OrganizationRequiredDocument @relation(fields: [documentId], references: [id])
  patient        Patient                      @relation(fields: [patientId], references: [id])
  logs           OrganizationDocumentApprovalLog[]

  @@unique([documentId, patientId])
  @@map("organization_document_patient_approvals")
}

model OrganizationDocumentApprovalLog {
  id                 String   @id @default(uuid())
  action             String
  patientApprovalId  String
  organizationUserId String
  createdAt          DateTime @default(now())

  patientApproval    OrganizationDocumentPatientApproval @relation(fields: [patientApprovalId], references: [id])

  @@map("organization_document_approval_logs")
}

enum DocumentApprovalStatus {
  PENDING
  REJECTED
  APPROVED
}
```

Add relation fields to existing models:

- `Organization.requiredDocuments OrganizationRequiredDocument[]`
- `Patient.documentApprovals OrganizationDocumentPatientApproval[]`

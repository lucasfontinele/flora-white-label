# Research: Backend de Documentos Obrigatórios e Aprovações

## Decision: Use a New `organization-documents` API Module

**Rationale**: The feature owns a workflow that is organization-scoped but
operates on patients and audit logs. Existing modules are bounded by business
features under `packages/api/src/modules/*`; adding a new module keeps document
configuration and approval workflow cohesive without overloading
`organizations` or `patients`.

**Alternatives considered**:

- Add required documents under `organizations` and approvals under `patients`.
  Rejected because it would split one workflow across two modules and duplicate
  routing/schema concerns.
- Add everything under `patients`. Rejected because required documents are
  organization configuration, not patient-owned data.

## Decision: Model `OrganizationDocumentPatientApproval` as Aggregate Root

**Rationale**: Approval owns the state machine (`PENDING`, `REJECTED`,
`APPROVED`), controls `rejectedReason` invariants, and is the consistency
boundary for audit log creation during approve/reject/reset.

**Alternatives considered**:

- Make `OrganizationRequiredDocument` the aggregate root. Rejected because the
  document requirement is configuration and does not own each patient's
  approval status.
- Treat all three models as independent records with use-case-only rules.
  Rejected because status/reason invariants belong in domain behavior and
  should be testable without persistence.

## Decision: Persist Audit Logs as an Explicit Entity, Not Global Domain Events

**Rationale**: The project has `AggregateRoot` domain-event buffering but no
dispatcher or persisted audit-log infrastructure. This feature requires
append-only operational logs now; a local `OrganizationDocumentApprovalLog`
entity and repository satisfy the requirement without introducing global audit
infrastructure.

**Alternatives considered**:

- Build a generic audit-log/event dispatcher. Rejected as broader than the
  requested backend slice.
- Store action text directly on approval records. Rejected because logs must be
  append-only and preserve multiple actions over time.

## Decision: Use Existing `UnitOfWork` for Approval Transition Atomicity

**Rationale**: `PrismaTransactionManager` already exists and lets repositories
share the active transaction via `AsyncLocalStorage`. Approve/reject/reset must
save the approval and append a log atomically, which matches the existing port.

**Alternatives considered**:

- Let repositories open ad hoc Prisma transactions. Rejected because use cases
  must not import Prisma and the project already has a transaction abstraction.
- Write approval first and log second without a transaction. Rejected because it
  can leave status changes without audit logs.

## Decision: Validate Input With Zod Only at Presentation Boundary

**Rationale**: Existing route modules keep Zod schemas in
`presentation/http/*-schemas.ts`, parse with `safeParse`, and return local 400
validation errors. Domain and application layers should remain free of Zod and
HTTP concerns.

**Alternatives considered**:

- Use Zod in use cases. Rejected because it would couple application behavior to
  a boundary validation library.
- Rely only on Fastify JSON schema. Rejected because existing code uses Zod for
  parsed data and stricter typed route input.

## Decision: Add Prisma Migration for Three Models and One Enum

**Rationale**: No current schema objects represent required document
configuration, patient document approval status, or audit logs. Persistence is
required for all three.

**Alternatives considered**:

- Reuse `PatientAssessment`. Rejected because it models patient assessment
  approval, not per-document required-document approvals.
- Store required document names inside organization settings. Rejected because
  approvals require stable document IDs and relational uniqueness.

## Decision: Store `organizationUserId` as Scalar Initially

**Rationale**: The spec says `organizationUserId` represents the organization
user who performed the action, but it explicitly excludes real RBAC and
permission validation. The current schema has both `User` and
`OrganizationEmployee`, so forcing a relation risks choosing the wrong actor
identity. A scalar preserves the contract and allows a future relation once the
product identity is settled.

**Alternatives considered**:

- Relate logs to `User.id`. Reasonable if `organizationUserId` means system
  user, but this may conflict with `OrganizationEmployee.id`.
- Relate logs to `OrganizationEmployee.id`. Reasonable for operator records,
  but the payload name says user and current auth context is user-based.

## Decision: Use Existing Application Errors

**Rationale**: Current global error handling already maps `NotFoundError` to
404, `ConflictError` to 409, and `DomainValidationError` to 422. Missing
documents, duplicate names, duplicate approvals, document-in-use, patient not
found, and invalid rejection reasons can be represented with these errors.

**Alternatives considered**:

- Add many feature-specific error classes. Rejected for this plan because the
  existing structured error mapping is adequate and simpler.

## Decision: Keep Create Approval Without Audit Actor in Request Body

**Rationale**: The spec's create approval payload includes only `documentId`.
Approve/reject/reset require `organizationUserId` and must create logs.
`CREATED_PATIENT_DOCUMENT_APPROVAL` remains a domain action value for future or
context-provided creation auditing, but this slice should not force a new body
field beyond the accepted contract.

**Alternatives considered**:

- Require `organizationUserId` on create approval. Rejected because it changes
  the requested payload.
- Generate a creation log with a synthetic actor. Rejected because audit logs
  must identify the organization user who performed the action.

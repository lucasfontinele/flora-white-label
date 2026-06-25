# Quickstart: Backend de Documentos Obrigatórios e Aprovações

## Prerequisites

- PostgreSQL database configured for `packages/api`.
- API environment variables configured as in the current backend setup.
- Existing organization, patient in that organization, and organization user or
  actor identifier for audit actions.

## Setup and Validation Commands

```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm test:api
pnpm typecheck:api
pnpm build:api
pnpm dev:api
```

Use the API base URL shown by `pnpm dev:api`. The examples below assume
`http://localhost:3333`.

## Scenario 1: Configure Required Documents

1. Create a required document:

   ```bash
   curl -i -X POST \
     http://localhost:3333/organizations/$ORGANIZATION_ID/required-documents \
     -H 'Content-Type: application/json' \
     -d '{"name":"Receita medica"}'
   ```

   Expected: `201` with `id`, `organizationId`, `name`, `createdAt`, and
   `updatedAt`.

2. List required documents:

   ```bash
   curl -i \
     http://localhost:3333/organizations/$ORGANIZATION_ID/required-documents
   ```

   Expected: `200` with `data` containing the created document.

3. Try to create the same document name in the same organization:

   ```bash
   curl -i -X POST \
     http://localhost:3333/organizations/$ORGANIZATION_ID/required-documents \
     -H 'Content-Type: application/json' \
     -d '{"name":"Receita medica"}'
   ```

   Expected: `409 ConflictError`.

4. Update the required document:

   ```bash
   curl -i -X PUT \
     http://localhost:3333/organizations/$ORGANIZATION_ID/required-documents/$DOCUMENT_ID \
     -H 'Content-Type: application/json' \
     -d '{"name":"Laudo medico"}'
   ```

   Expected: `200` with updated name.

## Scenario 2: Create and List Patient Document Approvals

1. Create an approval for a patient:

   ```bash
   curl -i -X POST \
     http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals \
     -H 'Content-Type: application/json' \
     -d '{"documentId":"'$DOCUMENT_ID'"}'
   ```

   Expected: `201` with status `PENDING` and `rejectedReason: null`.

2. Try to create the same approval again:

   ```bash
   curl -i -X POST \
     http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals \
     -H 'Content-Type: application/json' \
     -d '{"documentId":"'$DOCUMENT_ID'"}'
   ```

   Expected: `409 ConflictError`.

3. List approvals for the patient:

   ```bash
   curl -i \
     http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals
   ```

   Expected: `200` with `data` containing only approvals for that patient and
   organization.

## Scenario 3: Reject, Approve, Reset, and Audit Logs

1. Reject an approval:

   ```bash
   curl -i -X POST \
     http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals/$APPROVAL_ID/reject \
     -H 'Content-Type: application/json' \
     -d '{"organizationUserId":"'$ORGANIZATION_USER_ID'","rejectedReason":"Documento ilegivel."}'
   ```

   Expected: `200` with status `REJECTED` and the rejection reason.

2. Reject without reason:

   ```bash
   curl -i -X POST \
     http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals/$APPROVAL_ID/reject \
     -H 'Content-Type: application/json' \
     -d '{"organizationUserId":"'$ORGANIZATION_USER_ID'","rejectedReason":" "}'
   ```

   Expected: validation or domain error, no status change, and no new log.

3. Approve the approval:

   ```bash
   curl -i -X POST \
     http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals/$APPROVAL_ID/approve \
     -H 'Content-Type: application/json' \
     -d '{"organizationUserId":"'$ORGANIZATION_USER_ID'"}'
   ```

   Expected: `200` with status `APPROVED` and `rejectedReason: null`.

4. Reset to pending:

   ```bash
   curl -i -X POST \
     http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals/$APPROVAL_ID/reset-to-pending \
     -H 'Content-Type: application/json' \
     -d '{"organizationUserId":"'$ORGANIZATION_USER_ID'"}'
   ```

   Expected: `200` with status `PENDING` and `rejectedReason: null`.

5. List audit logs:

   ```bash
   curl -i \
     http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals/$APPROVAL_ID/logs
   ```

   Expected: `200` with append-only logs for `REJECTED_DOCUMENT`,
   `APPROVED_DOCUMENT`, and `RESET_DOCUMENT_TO_PENDING` in creation order.

## Negative Scope Checks

- No frontend files are required or changed.
- No request or response contains a file, file URL, storage provider key,
  presigned URL, download URL, OCR result, or file validation result.
- No auth/RBAC middleware is required for these scenarios.

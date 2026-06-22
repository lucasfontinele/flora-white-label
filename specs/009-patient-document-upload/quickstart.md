# Quickstart: Upload Backend de Documentos do Paciente

## Prerequisites

- PostgreSQL database configured for `packages/api`.
- Existing organization, patient, required document, and patient document
  approval created through the previous document-approval feature.
- Cloudflare R2 bucket and API credentials configured for the API environment.
- A local PDF, JPEG, or PNG file within `MAX_DOCUMENT_UPLOAD_SIZE_BYTES`.

## Setup and Validation Commands

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm test:api
pnpm typecheck:api
pnpm --filter @flora/api lint
pnpm build:api
pnpm dev:api
```

`pnpm install` is required only when new multipart/R2 dependencies have not yet
been installed.

## Required Environment

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PRESIGNED_URL_EXPIRES_IN=900
MAX_DOCUMENT_UPLOAD_SIZE_BYTES=10485760
DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES=application/pdf,image/jpeg,image/png
```

## Scenario 1: Upload a Patient Document

```bash
curl -i -X POST \
  http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals/$APPROVAL_ID/upload \
  -F "file=@./sample.pdf;type=application/pdf"
```

Expected:

- Response status is `200`.
- Response includes `fileName`, `mimeType`, `size`, `storageKey`, and `fileUrl`.
- `status` is `PENDING`.
- `rejectedReason` is `null`.
- No bucket name, account id, access key, or secret appears in the response.

## Scenario 2: Reupload a Rejected Document

1. Reject the approval using the existing reject endpoint.
2. Upload a replacement file:

   ```bash
   curl -i -X POST \
     http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals/$APPROVAL_ID/upload \
     -F "file=@./replacement.png;type=image/png"
   ```

Expected:

- Response status is `200`.
- Metadata reflects the replacement file.
- `status` returns to `PENDING`.
- `rejectedReason` is `null`.
- Previous R2 object cleanup is not performed by this feature.

## Scenario 3: List Approvals With Generated File URLs

```bash
curl -i \
  http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals
```

Expected:

- Response status is `200`.
- Approvals with `storageKey` include non-null `fileUrl`.
- Approvals without `storageKey` include `fileUrl: null`.
- All returned approvals belong to the requested organization and patient.

## Scenario 4: Invalid Uploads

Try each invalid case:

```bash
curl -i -X POST \
  http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals/$APPROVAL_ID/upload

curl -i -X POST \
  http://localhost:3333/organizations/$ORGANIZATION_ID/patients/$PATIENT_ID/document-approvals/$APPROVAL_ID/upload \
  -F "file=@./sample.txt;type=text/plain"
```

Expected:

- Missing file returns validation error.
- Unsupported MIME type returns validation error.
- Oversized files return validation error.
- Approval metadata is unchanged.
- No upload log is added for failed uploads.

## Negative Scope Checks

- No frontend files are required or changed.
- No direct browser upload or presigned POST exists.
- No old-file deletion is performed.
- No OCR, antivirus, content validation, new auth, RBAC, cookies, or IronSession
  is required for these scenarios.

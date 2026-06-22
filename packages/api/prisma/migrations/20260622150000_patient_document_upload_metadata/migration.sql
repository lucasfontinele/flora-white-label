ALTER TABLE "organization_document_patient_approvals"
ADD COLUMN "fileName" TEXT,
ADD COLUMN "mimeType" TEXT,
ADD COLUMN "size" INTEGER,
ADD COLUMN "storageKey" TEXT;


-- CreateEnum
CREATE TYPE "DocumentApprovalStatus" AS ENUM ('PENDING', 'REJECTED', 'APPROVED');

-- CreateTable
CREATE TABLE "organization_required_documents" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_required_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_document_patient_approvals" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "DocumentApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_document_patient_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_document_approval_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "patientApprovalId" TEXT NOT NULL,
    "organizationUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_document_approval_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_required_documents_organizationId_name_key"
ON "organization_required_documents"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "organization_document_patient_approvals_documentId_patientId_key"
ON "organization_document_patient_approvals"("documentId", "patientId");

-- AddForeignKey
ALTER TABLE "organization_required_documents"
ADD CONSTRAINT "organization_required_documents_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_document_patient_approvals"
ADD CONSTRAINT "organization_document_patient_approvals_documentId_fkey"
FOREIGN KEY ("documentId") REFERENCES "organization_required_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_document_patient_approvals"
ADD CONSTRAINT "organization_document_patient_approvals_patientId_fkey"
FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_document_approval_logs"
ADD CONSTRAINT "organization_document_approval_logs_patientApprovalId_fkey"
FOREIGN KEY ("patientApprovalId") REFERENCES "organization_document_patient_approvals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

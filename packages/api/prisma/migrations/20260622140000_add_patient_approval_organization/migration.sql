-- AlterTable
ALTER TABLE "organization_document_patient_approvals" ADD COLUMN "organizationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "organization_document_patient_approvals" ADD CONSTRAINT "organization_document_patient_approvals_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

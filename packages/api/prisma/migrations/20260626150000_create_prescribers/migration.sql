-- CreateTable: structured prescriber (médico prescritor) attached to a patient.
-- A patient may have many prescribers; the same CRM/UF cannot repeat per patient.
CREATE TABLE "prescribers" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "crm" TEXT NOT NULL,
    "crmState" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prescribers_organizationId_idx" ON "prescribers"("organizationId");

-- CreateIndex
CREATE INDEX "prescribers_patientId_idx" ON "prescribers"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "prescribers_patientId_crm_crmState_key" ON "prescribers"("patientId", "crm", "crmState");

-- AddForeignKey
ALTER TABLE "prescribers" ADD CONSTRAINT "prescribers_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

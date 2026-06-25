-- CreateTable
CREATE TABLE "patient_prescriptions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_prescriptions_patientId_key" ON "patient_prescriptions"("patientId");

-- CreateIndex
CREATE INDEX "patient_prescriptions_organizationId_idx" ON "patient_prescriptions"("organizationId");

-- AddForeignKey
ALTER TABLE "patient_prescriptions" ADD CONSTRAINT "patient_prescriptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_prescriptions" ADD CONSTRAINT "patient_prescriptions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

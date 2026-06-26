-- CreateEnum
CREATE TYPE "PrescriptionPeriod" AS ENUM ('MONTHLY', 'ANNUAL');

-- AlterTable: add issuedAt to patient_prescriptions.
-- Existing rows have no recorded emission date; backfill from validUntil - 6
-- months (the regulatory validity window) so the column can be NOT NULL.
ALTER TABLE "patient_prescriptions" ADD COLUMN "issuedAt" TIMESTAMP(3);
UPDATE "patient_prescriptions" SET "issuedAt" = "validUntil" - INTERVAL '6 months' WHERE "issuedAt" IS NULL;
ALTER TABLE "patient_prescriptions" ALTER COLUMN "issuedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "allowedQuantity" INTEGER NOT NULL,
    "period" "PrescriptionPeriod" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prescription_items_prescriptionId_idx" ON "prescription_items"("prescriptionId");

-- CreateIndex
CREATE INDEX "prescription_items_productId_idx" ON "prescription_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "prescription_items_prescriptionId_productId_key" ON "prescription_items"("prescriptionId", "productId");

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "patient_prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

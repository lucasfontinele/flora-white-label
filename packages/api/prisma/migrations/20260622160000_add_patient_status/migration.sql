-- CreateEnum
CREATE TYPE "PatientStatus" AS ENUM ('WAITING_DOCUMENTS', 'WAITING_APPROVAL', 'APPROVAL', 'REJECTED');

-- AlterTable
ALTER TABLE "patients" ADD COLUMN "patientStatus" "PatientStatus" NOT NULL DEFAULT 'WAITING_DOCUMENTS',
ADD COLUMN "rejectionReason" TEXT;

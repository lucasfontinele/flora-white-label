-- AlterTable
ALTER TABLE "users" ADD COLUMN "guardianId" TEXT,
ADD COLUMN "patientId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "guardians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

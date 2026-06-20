-- Invert the employee <-> user relation: the User now owns the FK
-- (organizationEmployeeId), mirroring guardianId / patientId. The employee
-- table has no rows yet, so dropping userId is safe.

ALTER TABLE "organizations_employees" DROP CONSTRAINT "organizations_employees_userId_fkey";

DROP INDEX "organizations_employees_userId_key";

ALTER TABLE "organizations_employees" DROP COLUMN "userId";

ALTER TABLE "users" ADD COLUMN "organizationEmployeeId" TEXT;

ALTER TABLE "users" ADD CONSTRAINT "users_organizationEmployeeId_fkey" FOREIGN KEY ("organizationEmployeeId") REFERENCES "organizations_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

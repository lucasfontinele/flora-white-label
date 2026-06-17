CREATE TYPE "UserRole" AS ENUM ('TUTOR', 'PATIENT');

CREATE TYPE "PatientType" AS ENUM ('HUMANO', 'ANIMAL');

CREATE TYPE "PatientGender" AS ENUM (
  'MASCULINO',
  'FEMININO',
  'OUTRO',
  'PREFIRO_NAO_INFORMAR'
);

CREATE TYPE "PatientGuardianRelationship" AS ENUM (
  'MAE_PAI',
  'TUTOR',
  'FILHO',
  'CUIDADOR',
  'PROCURADOR'
);

CREATE TYPE "PetSpecies" AS ENUM (
  'CANINA',
  'FELINA',
  'EQUINA',
  'AVIARIA',
  'EXOTICA',
  'SILVESTRE',
  'OUTRAS'
);

ALTER TABLE "users"
  ADD COLUMN "role" "UserRole";

CREATE TABLE "patients" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "organizationId" TEXT,
  "fullName" TEXT NOT NULL,
  "document" TEXT,
  "type" "PatientType" NOT NULL,
  "birthDate" TIMESTAMP(3),
  "nickname" TEXT,
  "gender" "PatientGender",
  "phone" TEXT,
  "addressId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "patient_guardians" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "document" TEXT NOT NULL,
  "rg" TEXT,
  "birthDate" TIMESTAMP(3) NOT NULL,
  "phone" TEXT NOT NULL,
  "relationship" "PatientGuardianRelationship" NOT NULL,
  "addressId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "patient_guardians_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pets" (
  "id" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "species" "PetSpecies" NOT NULL,
  "breed" VARCHAR(100),
  "birthDate" TIMESTAMP(3),
  "diagnosis" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "patients_userId_key" ON "patients"("userId");
CREATE UNIQUE INDEX "patients_addressId_key" ON "patients"("addressId");
CREATE INDEX "patients_organizationId_idx" ON "patients"("organizationId");
CREATE INDEX "patients_document_idx" ON "patients"("document");
CREATE INDEX "patients_type_idx" ON "patients"("type");

CREATE UNIQUE INDEX "patient_guardians_addressId_key" ON "patient_guardians"("addressId");
CREATE UNIQUE INDEX "patient_guardians_userId_patientId_key" ON "patient_guardians"("userId", "patientId");
CREATE INDEX "patient_guardians_patientId_idx" ON "patient_guardians"("patientId");
CREATE INDEX "patient_guardians_document_idx" ON "patient_guardians"("document");

CREATE UNIQUE INDEX "pets_patientId_key" ON "pets"("patientId");
CREATE INDEX "pets_species_idx" ON "pets"("species");

ALTER TABLE "patients"
  ADD CONSTRAINT "patients_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "patients"
  ADD CONSTRAINT "patients_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "patients"
  ADD CONSTRAINT "patients_addressId_fkey"
  FOREIGN KEY ("addressId") REFERENCES "addresses"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "patient_guardians"
  ADD CONSTRAINT "patient_guardians_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patient_guardians"
  ADD CONSTRAINT "patient_guardians_patientId_fkey"
  FOREIGN KEY ("patientId") REFERENCES "patients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "patient_guardians"
  ADD CONSTRAINT "patient_guardians_addressId_fkey"
  FOREIGN KEY ("addressId") REFERENCES "addresses"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pets"
  ADD CONSTRAINT "pets_patientId_fkey"
  FOREIGN KEY ("patientId") REFERENCES "patients"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

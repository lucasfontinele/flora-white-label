-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('FLOWER', 'OIL', 'EXTRACT', 'CAPSULE', 'EDIBLE', 'TOPICAL', 'VAPORIZER', 'ACCESSORY', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('CBD', 'THC', 'BALANCED', 'FULL_SPECTRUM', 'BROAD_SPECTRUM', 'ISOLATE');

-- CreateEnum
CREATE TYPE "StrainType" AS ENUM ('INDICA', 'SATIVA', 'HYBRID');

-- CreateEnum
CREATE TYPE "ProductUnit" AS ENUM ('GRAM', 'MILLILITER', 'UNIT');

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ProductCategory" NOT NULL,
    "type" "ProductType" NOT NULL,
    "strainType" "StrainType",
    "thcPercentage" DOUBLE PRECISION,
    "cbdPercentage" DOUBLE PRECISION,
    "unit" "ProductUnit" NOT NULL,
    "priceInCents" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_organizationId_idx" ON "products"("organizationId");

-- CreateIndex
CREATE INDEX "products_organizationId_isActive_idx" ON "products"("organizationId", "isActive");

-- AddForeignKey
ALTER TABLE "products"
ADD CONSTRAINT "products_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

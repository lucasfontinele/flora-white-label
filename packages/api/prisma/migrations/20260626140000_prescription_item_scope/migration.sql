-- CreateEnum
CREATE TYPE "PrescriptionItemScope" AS ENUM ('PRODUCT', 'CATEGORY');

-- AlterTable: a posology line is now scoped to a single product OR a whole
-- product category. Existing rows are product-scoped; productId becomes optional
-- and a nullable category is added for category-scoped lines.
ALTER TABLE "prescription_items" ADD COLUMN "scope" "PrescriptionItemScope" NOT NULL DEFAULT 'PRODUCT';
ALTER TABLE "prescription_items" ADD COLUMN "category" "ProductCategory";
ALTER TABLE "prescription_items" ALTER COLUMN "productId" DROP NOT NULL;

-- CreateIndex: one category line per prescription (NULLs are distinct in
-- Postgres, so product-scoped rows with a null category are unaffected).
CREATE UNIQUE INDEX "prescription_items_prescriptionId_category_key" ON "prescription_items"("prescriptionId", "category");

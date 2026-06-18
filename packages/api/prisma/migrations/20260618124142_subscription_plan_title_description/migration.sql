/*
  Warnings:

  - Existing rows receive a temporary title while the required column is added. The default is removed after the backfill.

*/
-- AlterTable
ALTER TABLE "subscription_plans"
  ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Plano sem titulo',
  ADD COLUMN "description" TEXT;

ALTER TABLE "subscription_plans"
  ALTER COLUMN "title" DROP DEFAULT;

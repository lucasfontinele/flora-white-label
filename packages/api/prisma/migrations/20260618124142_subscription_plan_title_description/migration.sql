/*
  Warnings:

  - Added the required column `description` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscription_plans"
  ADD COLUMN "title" TEXT NOT NULL;
  ADD COLUMN "description" TEXT DEFAULT NULL,
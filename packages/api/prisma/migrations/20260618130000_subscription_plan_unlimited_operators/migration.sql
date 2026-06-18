-- Add the unlimited-operators flag to subscription plans.
-- Also finalize the "description" nullability here, as a forward migration,
-- because the nullability change was made in an already-applied migration that
-- must not be re-run.

-- AlterTable
ALTER TABLE "subscription_plans" ALTER COLUMN "description" DROP NOT NULL;

ALTER TABLE "subscription_plans" ADD COLUMN "unlimitedOperators" BOOLEAN NOT NULL DEFAULT false;

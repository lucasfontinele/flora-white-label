-- Add the organization slug used for subdomain-based tenant resolution.
-- Added nullable first, backfilled from the trade name (deduplicated), then
-- enforced NOT NULL + UNIQUE so the change is safe on a table with existing rows.

ALTER TABLE "organizations" ADD COLUMN "slug" TEXT;

WITH base_slugs AS (
  SELECT
    "id",
    NULLIF(trim(BOTH '-' FROM regexp_replace(lower("tradeName"), '[^a-z0-9]+', '-', 'g')), '') AS base
  FROM "organizations"
),
numbered AS (
  SELECT
    "id",
    COALESCE(base, 'organizacao') AS base,
    row_number() OVER (PARTITION BY COALESCE(base, 'organizacao') ORDER BY "id") AS rn
  FROM base_slugs
)
UPDATE "organizations" AS o
SET "slug" = numbered.base || CASE WHEN numbered.rn = 1 THEN '' ELSE '-' || numbered.rn END
FROM numbered
WHERE o."id" = numbered."id";

ALTER TABLE "organizations" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

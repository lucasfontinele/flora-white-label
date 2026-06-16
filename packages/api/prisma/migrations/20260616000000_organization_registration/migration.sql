CREATE TYPE "OperatorLimitType" AS ENUM ('limited', 'unlimited');

CREATE TABLE "addresses" (
  "id" TEXT NOT NULL,
  "cep" TEXT NOT NULL,
  "logradouro" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "complement" TEXT,
  "neighborhood" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscription_plans" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "priceInCents" INTEGER NOT NULL,
  "maxActiveUsers" INTEGER NOT NULL,
  "operatorLimitType" "OperatorLimitType" NOT NULL,
  "maxOperators" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "organizations" (
  "id" TEXT NOT NULL,
  "legalName" TEXT NOT NULL,
  "tradeName" TEXT NOT NULL,
  "cnpj" TEXT NOT NULL,
  "foundationDate" TIMESTAMP(3) NOT NULL,
  "primaryCnae" TEXT NOT NULL,
  "secondaryCnaes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "institutionalEmail" TEXT NOT NULL,
  "whatsapp" TEXT NOT NULL,
  "addressId" TEXT NOT NULL,
  "subscriptionPlanId" TEXT NOT NULL,
  "createdByMasterUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");
CREATE UNIQUE INDEX "organizations_cnpj_key" ON "organizations"("cnpj");
CREATE UNIQUE INDEX "organizations_addressId_key" ON "organizations"("addressId");
CREATE INDEX "organizations_subscriptionPlanId_idx" ON "organizations"("subscriptionPlanId");

ALTER TABLE "organizations"
  ADD CONSTRAINT "organizations_addressId_fkey"
  FOREIGN KEY ("addressId") REFERENCES "addresses"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "organizations"
  ADD CONSTRAINT "organizations_subscriptionPlanId_fkey"
  FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "subscription_plans" (
  "id",
  "code",
  "name",
  "priceInCents",
  "maxActiveUsers",
  "operatorLimitType",
  "maxOperators",
  "updatedAt"
) VALUES
  ('plan_starter', 'starter', 'Starter', 59700, 50, 'limited', 10, CURRENT_TIMESTAMP),
  ('plan_growth', 'growth', 'Growth', 99700, 100, 'limited', 30, CURRENT_TIMESTAMP),
  ('plan_unlimited', 'unlimited', 'Unlimited', 209700, 3000, 'unlimited', NULL, CURRENT_TIMESTAMP);

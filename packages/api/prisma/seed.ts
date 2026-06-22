import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

/**
 * Idempotent seed for backoffice authentication.
 *
 * Patients/guardians self-register through the public registration flow, but
 * there is no self-service path to create Master or Organization users — so a
 * fresh database has no way to sign into the backoffices. This seed provisions
 * one valid user of each backoffice profile (with the invariants enforced by
 * the `User` domain entity) so those views can be exercised locally.
 *
 * Re-running is safe: every record is upserted by a stable key.
 */
const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? "Flora@123";

const MASTER_EMAIL = "master@flora.local";
const ORGANIZATION_EMAIL = "gestor@flora.local";

async function resolveOrganization() {
  // Prefer an organization that already exists (e.g. one created through the
  // Master backoffice); otherwise stand up a self-contained demo organization.
  const existing = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) {
    return existing;
  }

  const plan = await prisma.subscriptionPlan.upsert({
    where: { id: "seed-plan-demo" },
    update: {},
    create: {
      id: "seed-plan-demo",
      title: "Demo",
      description: "Plano de demonstração criado pelo seed.",
      priceInCents: 0,
      operatorsLimit: 10,
      patientsLimit: 100,
    },
  });

  const address = await prisma.address.upsert({
    where: { id: "seed-address-demo" },
    update: {},
    create: {
      id: "seed-address-demo",
      zipcode: "00000-000",
      street: "Rua Demo",
      neighborhood: "Centro",
      city: "Palmas",
      state: "TO",
    },
  });

  const organization = await prisma.organization.upsert({
    where: { slug: "flora-demo" },
    update: {},
    create: {
      id: "seed-org-demo",
      slug: "flora-demo",
      tradeName: "Flora Demo",
      legalName: "Flora Demo Associação",
      cnpj: "00000000000000",
      primaryCnae: "8690901",
      secondaryCnaes: [],
      currentPlanId: plan.id,
      addressId: address.id,
    },
  });

  await prisma.organizationSettings.upsert({
    where: { organizationId: organization.id },
    update: {},
    create: { organizationId: organization.id },
  });

  return organization;
}

async function main() {
  const passwordHashed = await argon2.hash(DEMO_PASSWORD, { type: argon2.argon2id });
  const organization = await resolveOrganization();

  // Master: backoffice admin. Must NOT be linked to a patient/guardian/employee.
  await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: MASTER_EMAIL } },
    update: { passwordHashed, profile: "Master" },
    create: {
      organizationId: organization.id,
      email: MASTER_EMAIL,
      passwordHashed,
      profile: "Master",
    },
  });

  // Organization: backoffice operator. Must be linked to an OrganizationEmployee.
  const employee = await prisma.organizationEmployee.upsert({
    where: {
      organizationId_document: { organizationId: organization.id, document: "00000000000" },
    },
    update: {},
    create: {
      organizationId: organization.id,
      fullName: "Operador Demo",
      document: "00000000000",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: ORGANIZATION_EMAIL } },
    update: { passwordHashed, profile: "Organization", organizationEmployeeId: employee.id },
    create: {
      organizationId: organization.id,
      email: ORGANIZATION_EMAIL,
      passwordHashed,
      profile: "Organization",
      organizationEmployeeId: employee.id,
    },
  });

  console.info("Seed concluído. Logins de backoffice (org %s):", organization.slug);
  console.info("  Master:       %s / %s", MASTER_EMAIL, DEMO_PASSWORD);
  console.info("  Organization: %s / %s", ORGANIZATION_EMAIL, DEMO_PASSWORD);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Argon2PasswordHasher } from "../src/infrastructure/security/argon2-password-hasher.js";

const prisma = new PrismaClient();
const passwordHasher = new Argon2PasswordHasher();
const testPassword = "Acesso@123";

async function main() {
  const passwordHash = await passwordHasher.hash(testPassword);
  const organizationId = await ensureDemoOrganization();

  await prisma.user.upsert({
    create: {
      email: "master@flora.local",
      passwordHash,
      type: "MASTER",
    },
    update: {
      isActive: true,
      organizationId: null,
      passwordHash,
      role: null,
      type: "MASTER",
    },
    where: { email: "master@flora.local" },
  });

  await prisma.user.upsert({
    create: {
      email: "organizacao@flora.local",
      organizationId,
      passwordHash,
      type: "ORGANIZATION",
    },
    update: {
      isActive: true,
      organizationId,
      passwordHash,
      role: null,
      type: "ORGANIZATION",
    },
    where: { email: "organizacao@flora.local" },
  });

  await prisma.user.upsert({
    create: {
      email: "paciente@flora.local",
      organizationId,
      passwordHash,
      role: "PATIENT",
      type: "STANDARD",
    },
    update: {
      isActive: true,
      organizationId,
      passwordHash,
      role: "PATIENT",
      type: "STANDARD",
    },
    where: { email: "paciente@flora.local" },
  });
}

async function ensureDemoOrganization() {
  const existing = await prisma.organization.findFirst({
    select: { id: true },
    where: { isActive: true },
  });

  if (existing) return existing.id;

  const plan =
    (await prisma.subscriptionPlan.findUnique({ where: { code: "starter" } })) ??
    (await prisma.subscriptionPlan.create({
      data: {
        code: "starter",
        id: "plan_starter",
        maxActiveUsers: 50,
        maxOperators: 10,
        name: "Starter",
        operatorLimitType: "limited",
        priceInCents: 59700,
      },
    }));

  const address = await prisma.address.create({
    data: {
      cep: "77001000",
      city: "Palmas",
      logradouro: "Quadra 101 Sul",
      neighborhood: "Plano Diretor Sul",
      number: "10",
      state: "TO",
    },
  });

  const organization = await prisma.organization.create({
    data: {
      addressId: address.id,
      cnpj: "00999999000191",
      createdByMasterUserId: "seed_master",
      foundationDate: new Date("2020-01-15T00:00:00.000Z"),
      institutionalEmail: "demo@flora.local",
      isActive: true,
      legalName: "Associacao Demo Flora LTDA",
      primaryCnae: "9430800",
      subscriptionPlanId: plan.id,
      tradeName: "Associacao Demo Flora",
      whatsapp: "63999990000",
    },
  });

  return organization.id;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

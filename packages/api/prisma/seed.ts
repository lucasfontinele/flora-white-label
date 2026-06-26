import {
  PrismaClient,
  ProductCategory,
  ProductType,
  ProductUnit,
  StrainType,
} from "@prisma/client";
import argon2 from "argon2";
import {
  DEFAULT_ROLE_TEMPLATES,
  SUPER_ADMIN_ROLE_TEMPLATE,
  type DefaultRoleTemplate,
} from "../src/modules/access-control/domain/default-roles.js";

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
const SUPER_ADMIN_EMAIL = "admin@flora.local";

/**
 * Seeds a system role for an organization only when it is missing, so re-running
 * the seed never clobbers permission edits made through the access screen.
 */
async function ensureRole(organizationId: string, template: DefaultRoleTemplate) {
  const existing = await prisma.role.findUnique({
    where: { organizationId_key: { organizationId, key: template.key } },
  });
  if (existing) {
    return existing;
  }

  const role = await prisma.role.create({
    data: {
      organizationId,
      key: template.key,
      name: template.name,
      description: template.description,
      isSystem: template.isSystem,
      fullAccess: template.fullAccess,
      viewAll: template.viewAll,
    },
  });

  if (template.permissions.length > 0) {
    await prisma.rolePermission.createMany({
      data: template.permissions.map((permission) => ({
        roleId: role.id,
        module: permission.module,
        action: permission.action,
      })),
    });
  }

  return role;
}

async function seedRoles(organizationId: string) {
  for (const template of [...DEFAULT_ROLE_TEMPLATES, SUPER_ADMIN_ROLE_TEMPLATE]) {
    await ensureRole(organizationId, template);
  }
}

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

type ProductSeed = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  type: ProductType;
  strainType?: StrainType;
  thcPercentage?: number;
  cbdPercentage?: number;
  unit: ProductUnit;
  priceInCents: number;
  availableQuantity: number;
  minimumQuantity: number;
};

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    id: "seed-product-flor-cbd-charlotte",
    name: "Flor CBD Charlotte's Angel",
    description: "Flor seca rica em CBD, baixo THC. Indicada para ansiedade e dores crônicas.",
    category: ProductCategory.FLOWER,
    type: ProductType.CBD,
    strainType: StrainType.SATIVA,
    thcPercentage: 0.8,
    cbdPercentage: 15,
    unit: ProductUnit.GRAM,
    priceInCents: 4500,
    availableQuantity: 500,
    minimumQuantity: 50,
  },
  {
    id: "seed-product-flor-thc-northern",
    name: "Flor THC Northern Lights",
    description: "Flor seca indica com alto teor de THC. Indicada para insônia e dores agudas.",
    category: ProductCategory.FLOWER,
    type: ProductType.THC,
    strainType: StrainType.INDICA,
    thcPercentage: 22,
    cbdPercentage: 1,
    unit: ProductUnit.GRAM,
    priceInCents: 5500,
    availableQuantity: 300,
    minimumQuantity: 40,
  },
  {
    id: "seed-product-flor-hybrid-balanced",
    name: "Flor Balanced Harlequin",
    description: "Flor híbrida com proporção equilibrada de THC e CBD.",
    category: ProductCategory.FLOWER,
    type: ProductType.BALANCED,
    strainType: StrainType.HYBRID,
    thcPercentage: 8,
    cbdPercentage: 8,
    unit: ProductUnit.GRAM,
    priceInCents: 5000,
    availableQuantity: 250,
    minimumQuantity: 30,
  },
  {
    id: "seed-product-oleo-cbd-full",
    name: "Óleo Full Spectrum CBD 30%",
    description: "Óleo full spectrum, 30% CBD. Frasco de 30ml com conta-gotas.",
    category: ProductCategory.OIL,
    type: ProductType.FULL_SPECTRUM,
    thcPercentage: 1.5,
    cbdPercentage: 30,
    unit: ProductUnit.MILLILITER,
    priceInCents: 32000,
    availableQuantity: 120,
    minimumQuantity: 20,
  },
  {
    id: "seed-product-oleo-cbd-isolado",
    name: "Óleo Isolado CBD 20%",
    description: "Óleo de CBD isolado, sem THC. Frasco de 30ml.",
    category: ProductCategory.OIL,
    type: ProductType.ISOLATE,
    thcPercentage: 0,
    cbdPercentage: 20,
    unit: ProductUnit.MILLILITER,
    priceInCents: 24000,
    availableQuantity: 80,
    minimumQuantity: 15,
  },
  {
    id: "seed-product-oleo-thc-broad",
    name: "Óleo Broad Spectrum THC 10%",
    description: "Óleo broad spectrum com predominância de THC. Frasco de 30ml.",
    category: ProductCategory.OIL,
    type: ProductType.BROAD_SPECTRUM,
    thcPercentage: 10,
    cbdPercentage: 5,
    unit: ProductUnit.MILLILITER,
    priceInCents: 28000,
    availableQuantity: 60,
    minimumQuantity: 15,
  },
  {
    id: "seed-product-extrato-rso",
    name: "Extrato Concentrado RSO",
    description: "Extrato concentrado full spectrum em seringa de 1g.",
    category: ProductCategory.EXTRACT,
    type: ProductType.FULL_SPECTRUM,
    thcPercentage: 60,
    cbdPercentage: 10,
    unit: ProductUnit.GRAM,
    priceInCents: 18000,
    availableQuantity: 40,
    minimumQuantity: 10,
  },
  {
    id: "seed-product-capsula-cbd",
    name: "Cápsulas CBD 25mg",
    description: "Cápsulas de CBD isolado, 25mg por unidade. Pote com 30 cápsulas.",
    category: ProductCategory.CAPSULE,
    type: ProductType.ISOLATE,
    thcPercentage: 0,
    cbdPercentage: 100,
    unit: ProductUnit.UNIT,
    priceInCents: 15000,
    availableQuantity: 200,
    minimumQuantity: 25,
  },
  {
    id: "seed-product-comestivel-gummies",
    name: "Gummies CBD/THC 1:1",
    description: "Goma comestível com proporção equilibrada de CBD e THC. Pote com 20 unidades.",
    category: ProductCategory.EDIBLE,
    type: ProductType.BALANCED,
    thcPercentage: 5,
    cbdPercentage: 5,
    unit: ProductUnit.UNIT,
    priceInCents: 13000,
    availableQuantity: 150,
    minimumQuantity: 20,
  },
  {
    id: "seed-product-topico-pomada",
    name: "Pomada Tópica CBD",
    description: "Pomada de uso tópico com CBD para alívio localizado. Bisnaga de 50g.",
    category: ProductCategory.TOPICAL,
    type: ProductType.BROAD_SPECTRUM,
    thcPercentage: 0,
    cbdPercentage: 5,
    unit: ProductUnit.UNIT,
    priceInCents: 11000,
    availableQuantity: 90,
    minimumQuantity: 15,
  },
  {
    id: "seed-product-vaporizador-cartucho",
    name: "Cartucho Vaporizador THC",
    description: "Cartucho de óleo para vaporizador, alto THC. 0,5ml.",
    category: ProductCategory.VAPORIZER,
    type: ProductType.THC,
    strainType: StrainType.HYBRID,
    thcPercentage: 80,
    cbdPercentage: 2,
    unit: ProductUnit.UNIT,
    priceInCents: 22000,
    availableQuantity: 70,
    minimumQuantity: 10,
  },
  {
    id: "seed-product-acessorio-vaporizador",
    name: "Vaporizador Portátil",
    description: "Vaporizador portátil para flores secas. Acessório.",
    category: ProductCategory.ACCESSORY,
    type: ProductType.ISOLATE,
    unit: ProductUnit.UNIT,
    priceInCents: 45000,
    availableQuantity: 25,
    minimumQuantity: 5,
  },
];

/**
 * Seeds a demonstration product catalogue (with inventory) for an organization.
 * Idempotent: products and inventory items are upserted by a stable key, so
 * re-running never duplicates rows nor clobbers stock edited through the app.
 */
async function seedProducts(organizationId: string) {
  for (const seed of PRODUCT_SEEDS) {
    const product = await prisma.product.upsert({
      where: { id: seed.id },
      update: {
        name: seed.name,
        description: seed.description,
        category: seed.category,
        type: seed.type,
        strainType: seed.strainType ?? null,
        thcPercentage: seed.thcPercentage ?? null,
        cbdPercentage: seed.cbdPercentage ?? null,
        unit: seed.unit,
        priceInCents: seed.priceInCents,
      },
      create: {
        id: seed.id,
        organizationId,
        name: seed.name,
        description: seed.description,
        category: seed.category,
        type: seed.type,
        strainType: seed.strainType ?? null,
        thcPercentage: seed.thcPercentage ?? null,
        cbdPercentage: seed.cbdPercentage ?? null,
        unit: seed.unit,
        priceInCents: seed.priceInCents,
      },
    });

    await prisma.inventoryItem.upsert({
      where: { organizationId_productId: { organizationId, productId: product.id } },
      update: { minimumQuantity: seed.minimumQuantity },
      create: {
        organizationId,
        productId: product.id,
        availableQuantity: seed.availableQuantity,
        minimumQuantity: seed.minimumQuantity,
      },
    });
  }
}

async function main() {
  const passwordHashed = await argon2.hash(DEMO_PASSWORD, { type: argon2.argon2id });
  const organization = await resolveOrganization();

  // Provision the default access roles for every organization in the database,
  // so the access screen always has the suggested roles to start from.
  const organizations = await prisma.organization.findMany({ select: { id: true } });
  for (const org of organizations) {
    await seedRoles(org.id);
  }

  const operatorRole = await prisma.role.findUnique({
    where: { organizationId_key: { organizationId: organization.id, key: "OPERATOR" } },
  });
  const superAdminRole = await prisma.role.findUnique({
    where: { organizationId_key: { organizationId: organization.id, key: "SUPER_ADMIN" } },
  });

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
    update: { roleId: operatorRole?.id ?? null },
    create: {
      organizationId: organization.id,
      fullName: "Operador Demo",
      document: "00000000000",
      isActive: true,
      roleId: operatorRole?.id ?? null,
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

  // Super admin: an Organization user with total access to everything.
  const superAdminEmployee = await prisma.organizationEmployee.upsert({
    where: {
      organizationId_document: { organizationId: organization.id, document: "11111111111" },
    },
    update: { roleId: superAdminRole?.id ?? null },
    create: {
      organizationId: organization.id,
      fullName: "Super Admin",
      document: "11111111111",
      isActive: true,
      roleId: superAdminRole?.id ?? null,
    },
  });

  await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: SUPER_ADMIN_EMAIL } },
    update: {
      passwordHashed,
      profile: "Organization",
      organizationEmployeeId: superAdminEmployee.id,
    },
    create: {
      organizationId: organization.id,
      email: SUPER_ADMIN_EMAIL,
      passwordHashed,
      profile: "Organization",
      organizationEmployeeId: superAdminEmployee.id,
    },
  });

  // Demo product catalogue + inventory for the resolved organization.
  await seedProducts(organization.id);

  console.info("Seed concluído. Logins de backoffice (org %s):", organization.slug);
  console.info("  Produtos:     %d itens de catálogo com estoque", PRODUCT_SEEDS.length);
  console.info("  Master:       %s / %s", MASTER_EMAIL, DEMO_PASSWORD);
  console.info("  Organization: %s / %s", ORGANIZATION_EMAIL, DEMO_PASSWORD);
  console.info("  Super admin:  %s / %s", SUPER_ADMIN_EMAIL, DEMO_PASSWORD);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

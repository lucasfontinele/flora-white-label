import { describe, expect, it, vi } from "vitest";
import { ConflictException } from "../../exception/index.js";
import { PrismaOrganizationRepository } from "./prisma-organization-repository.js";

const plan = {
  code: "starter" as const,
  id: "plan_starter",
  maxActiveUsers: 50,
  maxOperators: 10,
  name: "Starter",
  operatorLimitType: "limited" as const,
  priceInCents: 59700,
};

const createInput = {
  address: {
    cep: "77001000",
    city: "Palmas",
    complement: undefined,
    logradouro: "Quadra 101 Sul",
    neighborhood: "Plano Diretor Sul",
    number: "10",
    state: "TO",
  },
  company: {
    cnpj: "11222333000181",
    foundationDate: new Date("2020-01-15T00:00:00.000Z"),
    institutionalEmail: "contato@associacao.org.br",
    legalName: "Associacao Medicinal Exemplo LTDA",
    primaryCnae: "9430-8/00",
    secondaryCnaes: [],
    tradeName: "Associacao Exemplo",
    whatsapp: "63999990000",
  },
  createdByMasterUserId: "master_1",
  subscriptionPlanId: "plan_starter",
};

describe("PrismaOrganizationRepository", () => {
  it("creates address and organization in one transaction", async () => {
    const tx = {
      address: {
        create: vi.fn().mockResolvedValue({ id: "addr_1", ...createInput.address }),
      },
      organization: {
        create: vi.fn().mockResolvedValue({
          id: "org_1",
          ...createInput.company,
          address: { id: "addr_1", ...createInput.address },
          addressId: "addr_1",
          createdAt: new Date("2026-06-16T00:00:00.000Z"),
          createdByMasterUserId: "master_1",
          subscriptionPlan: plan,
          subscriptionPlanId: "plan_starter",
          updatedAt: new Date("2026-06-16T00:00:00.000Z"),
        }),
      },
    };
    const prisma = {
      $transaction: vi.fn((callback) => callback(tx)),
      organization: {
        findUnique: vi.fn(),
      },
    };
    const repository = new PrismaOrganizationRepository(prisma as never);

    const result = await repository.create(createInput);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.address.create).toHaveBeenCalledWith({
      data: createInput.address,
    });
    expect(tx.organization.create).toHaveBeenCalledTimes(1);
    expect(result.id).toBe("org_1");
  });

  it("reports duplicate CNPJ from unique constraint failures", async () => {
    const prisma = {
      $transaction: vi.fn().mockRejectedValue({ code: "P2002", meta: { target: ["cnpj"] } }),
      organization: {
        findUnique: vi.fn(),
      },
    };
    const repository = new PrismaOrganizationRepository(prisma as never);

    await expect(repository.create(createInput)).rejects.toThrow(ConflictException);
  });
});

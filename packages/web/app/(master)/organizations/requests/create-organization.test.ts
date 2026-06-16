import { afterEach, describe, expect, it, vi } from "vitest";
import { createOrganization } from "./create-organization";

const input = {
  address: {
    cep: "77001000",
    city: "Palmas",
    logradouro: "Quadra 101 Sul",
    neighborhood: "Plano Diretor Sul",
    number: "10",
    state: "TO",
  },
  company: {
    cnpj: "11222333000181",
    foundationDate: "2020-01-15",
    facebook: "https://facebook.com/associacao",
    instagram: "https://instagram.com/associacao",
    institutionalEmail: "contato@associacao.org.br",
    linkedin: "https://linkedin.com/company/associacao",
    legalName: "Associacao Medicinal Exemplo LTDA",
    phone: "6333330000",
    primaryCnae: "9430800",
    secondaryCnaes: ["9499500"],
    site: "https://associacao.org.br",
    tradeName: "Associacao Exemplo",
    whatsapp: "63999990000",
  },
  subscriptionPlanId: "plan_starter",
};

const response = {
  data: {
    address: {
      id: "addr_1",
      ...input.address,
    },
    company: input.company,
    createdAt: "2026-06-16T00:00:00.000Z",
    createdByMasterUserId: "master_1",
    id: "org_1",
    subscriptionPlan: {
      code: "starter",
      id: "plan_starter",
      maxActiveUsers: 50,
      maxOperators: 10,
      name: "Starter",
      operatorLimitType: "limited",
      priceInCents: 59700,
    },
    updatedAt: "2026-06-16T00:00:00.000Z",
  },
};

describe("createOrganization", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts an organization registration payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(createOrganization(input)).resolves.toEqual(response);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3333/organizations",
      expect.objectContaining({
        body: JSON.stringify(input),
        headers: expect.any(Headers),
        method: "POST",
      }),
    );
  });
});

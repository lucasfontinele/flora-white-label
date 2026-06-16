import { describe, expect, it } from "vitest";
import { organizationRegistrationSchema } from "./organization-registration-schema";

const validInput = {
  address: {
    cep: "77001-000",
    city: "Palmas",
    complement: "",
    logradouro: "Quadra 101 Sul",
    neighborhood: "Plano Diretor Sul",
    number: "10",
    state: "TO",
  },
  company: {
    cnpj: "11.222.333/0001-81",
    foundationDate: "2020-01-15",
    institutionalEmail: "contato@associacao.org.br",
    legalName: "Associacao Medicinal Exemplo LTDA",
    primaryCnae: "9430-8/00",
    secondaryCnaes: [],
    tradeName: "Associacao Exemplo",
    whatsapp: "(63) 99999-0000",
  },
  subscriptionPlanId: "plan_starter",
};

describe("organizationRegistrationSchema", () => {
  it("accepts valid input with optional complement and secondary CNAEs omitted", () => {
    const result = organizationRegistrationSchema.safeParse({
      ...validInput,
      address: {
        ...validInput.address,
        complement: undefined,
      },
      company: {
        ...validInput.company,
        secondaryCnaes: undefined,
      },
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing required organization fields", () => {
    const result = organizationRegistrationSchema.safeParse({
      ...validInput,
      company: {
        ...validInput.company,
        legalName: "",
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid cents-safe plan input", () => {
    const result = organizationRegistrationSchema.safeParse({
      ...validInput,
      subscriptionPlanId: "",
    });

    expect(result.success).toBe(false);
  });
});

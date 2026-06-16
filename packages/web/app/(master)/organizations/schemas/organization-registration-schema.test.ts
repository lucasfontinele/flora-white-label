import { describe, expect, it } from "vitest";
import { organizationRegistrationSchema, organizationRegistrationStepFields } from "./organization-registration-schema";

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
    facebook: "https://facebook.com/associacao",
    instagram: "https://instagram.com/associacao",
    institutionalEmail: "contato@associacao.org.br",
    linkedin: "https://linkedin.com/company/associacao",
    legalName: "Associacao Medicinal Exemplo LTDA",
    phone: "(63) 3333-0000",
    primaryCnae: "9430-8/00",
    secondaryCnaes: ["9499-5/00"],
    site: "https://associacao.org.br",
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

  it("normalizes masked fields before submission", () => {
    const result = organizationRegistrationSchema.parse(validInput);

    expect(result.address.cep).toBe("77001000");
    expect(result.address.state).toBe("TO");
    expect(result.company.cnpj).toBe("11222333000181");
    expect(result.company.phone).toBe("6333330000");
    expect(result.company.whatsapp).toBe("63999990000");
    expect(result.company.primaryCnae).toBe("9430800");
    expect(result.company.secondaryCnaes).toEqual(["9499500"]);
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

  it("rejects descriptive or duplicated secondary CNAEs", () => {
    const descriptive = organizationRegistrationSchema.safeParse({
      ...validInput,
      company: {
        ...validInput.company,
        secondaryCnaes: ["9430-8/00 Atividades associativas"],
      },
    });
    const duplicated = organizationRegistrationSchema.safeParse({
      ...validInput,
      company: {
        ...validInput.company,
        secondaryCnaes: ["9430-8/00", "9430800"],
      },
    });

    expect(descriptive.success).toBe(false);
    expect(duplicated.success).toBe(false);
  });

  it("rejects a future foundation date", () => {
    const result = organizationRegistrationSchema.safeParse({
      ...validInput,
      company: {
        ...validInput.company,
        foundationDate: "2999-01-01",
      },
    });

    expect(result.success).toBe(false);
  });

  it("exposes field groups for step-by-step validation", () => {
    expect(organizationRegistrationStepFields.company).toContain("company.legalName");
    expect(organizationRegistrationStepFields.address).toContain("address.cep");
    expect(organizationRegistrationStepFields.plan).toEqual(["subscriptionPlanId"]);
  });
});

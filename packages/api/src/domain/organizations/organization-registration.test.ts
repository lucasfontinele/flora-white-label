import { describe, expect, it } from "vitest";
import { ValidationException } from "../../exception/index.js";
import { parseOrganizationRegistrationInput } from "./organization-registration.js";

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
    facebook: "https://facebook.com/associacao",
    foundationDate: "2020-01-15",
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

describe("parseOrganizationRegistrationInput", () => {
  it("normalizes valid organization registration input", () => {
    const parsed = parseOrganizationRegistrationInput(validInput, {
      now: new Date("2026-06-16T00:00:00.000Z"),
    });

    expect(parsed.company.cnpj).toBe("11222333000181");
    expect(parsed.address.cep).toBe("77001000");
    expect(parsed.address.state).toBe("TO");
    expect(parsed.company.phone).toBe("6333330000");
    expect(parsed.company.primaryCnae).toBe("9430800");
    expect(parsed.company.secondaryCnaes).toEqual(["9499500"]);
  });

  it("rejects invalid CNPJ, email, WhatsApp, and address data", () => {
    expect(() =>
      parseOrganizationRegistrationInput(
        {
          ...validInput,
          address: {
            ...validInput.address,
            cep: "123",
            state: "ZZ",
          },
          company: {
            ...validInput.company,
            cnpj: "11.111.111/1111-11",
            institutionalEmail: "invalid",
            whatsapp: "123",
          },
        },
        { now: new Date("2026-06-16T00:00:00.000Z") },
      ),
    ).toThrow(ValidationException);
  });

  it("rejects foundation dates in the future", () => {
    expect(() =>
      parseOrganizationRegistrationInput(
        {
          ...validInput,
          company: {
            ...validInput.company,
            foundationDate: "2027-01-01",
          },
        },
        { now: new Date("2026-06-16T00:00:00.000Z") },
      ),
    ).toThrow(ValidationException);
  });

  it("rejects descriptive, invalid, or duplicated CNAEs", () => {
    expect(() =>
      parseOrganizationRegistrationInput(
        {
          ...validInput,
          company: {
            ...validInput.company,
            primaryCnae: "9430-8/00 Atividades associativas",
          },
        },
        { now: new Date("2026-06-16T00:00:00.000Z") },
      ),
    ).toThrow(ValidationException);

    expect(() =>
      parseOrganizationRegistrationInput(
        {
          ...validInput,
          company: {
            ...validInput.company,
            secondaryCnaes: ["9430-8/00", "9430800"],
          },
        },
        { now: new Date("2026-06-16T00:00:00.000Z") },
      ),
    ).toThrow(ValidationException);
  });
});

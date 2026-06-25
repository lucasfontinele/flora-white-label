import { describe, expect, it } from "vitest";
import {
  organizationRegistrationSchema,
  organizationRegistrationStepFields,
  toOrganizationWriteBody,
} from "./organization-registration-schema";

const validInput = {
  organization: {
    legalName: "Associacao Medicinal Exemplo LTDA",
    tradeName: "Associacao Exemplo",
    cnpj: "11.222.333/0001-81",
    primaryCnae: "9430-8/00",
    secondaryCnaes: ["9499-5/00"],
  },
  address: {
    title: "",
    zipcode: "77001-000",
    street: "Quadra 101 Sul",
    number: "10",
    complement: "",
    neighborhood: "Plano Diretor Sul",
    city: "Palmas",
    state: "TO",
  },
  currentPlanId: "plan_starter",
};

describe("organizationRegistrationSchema", () => {
  it("accepts valid input with optional fields omitted", () => {
    const result = organizationRegistrationSchema.safeParse({
      ...validInput,
      address: { ...validInput.address, complement: undefined, title: undefined, number: undefined },
      organization: { ...validInput.organization, secondaryCnaes: undefined },
    });

    expect(result.success).toBe(true);
  });

  it("normalizes masked fields before submission", () => {
    const result = organizationRegistrationSchema.parse(validInput);

    expect(result.address.zipcode).toBe("77001000");
    expect(result.address.state).toBe("TO");
    expect(result.organization.cnpj).toBe("11222333000181");
    expect(result.organization.primaryCnae).toBe("9430800");
    expect(result.organization.secondaryCnaes).toEqual(["9499500"]);
  });

  it("rejects missing required organization fields", () => {
    const result = organizationRegistrationSchema.safeParse({
      ...validInput,
      organization: { ...validInput.organization, legalName: "" },
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty plan selection", () => {
    const result = organizationRegistrationSchema.safeParse({ ...validInput, currentPlanId: "" });

    expect(result.success).toBe(false);
  });

  it("rejects descriptive or duplicated secondary CNAEs", () => {
    const descriptive = organizationRegistrationSchema.safeParse({
      ...validInput,
      organization: { ...validInput.organization, secondaryCnaes: ["9430-8/00 Atividades associativas"] },
    });
    const duplicated = organizationRegistrationSchema.safeParse({
      ...validInput,
      organization: { ...validInput.organization, secondaryCnaes: ["9430-8/00", "9430800"] },
    });

    expect(descriptive.success).toBe(false);
    expect(duplicated.success).toBe(false);
  });

  it("exposes field groups for step-by-step validation", () => {
    expect(organizationRegistrationStepFields.organization).toContain("organization.legalName");
    expect(organizationRegistrationStepFields.address).toContain("address.zipcode");
    expect(organizationRegistrationStepFields.plan).toEqual(["currentPlanId"]);
  });
});

describe("toOrganizationWriteBody", () => {
  it("maps the validated values into the API write body, folding the number into the street", () => {
    const parsed = organizationRegistrationSchema.parse(validInput);
    const body = toOrganizationWriteBody(parsed);

    expect(body).toEqual({
      organization: {
        tradeName: "Associacao Exemplo",
        legalName: "Associacao Medicinal Exemplo LTDA",
        cnpj: "11222333000181",
        primaryCnae: "9430800",
        secondaryCnaes: ["9499500"],
        currentPlanId: "plan_starter",
      },
      address: {
        title: null,
        zipcode: "77001000",
        street: "Quadra 101 Sul, 10",
        neighborhood: "Plano Diretor Sul",
        complement: null,
        city: "Palmas",
        state: "TO",
      },
    });
  });

  it("keeps the street unchanged when no number is provided and preserves optional text", () => {
    const parsed = organizationRegistrationSchema.parse({
      ...validInput,
      address: { ...validInput.address, number: "", title: "Sede", complement: "Sala 2" },
    });
    const body = toOrganizationWriteBody(parsed);

    expect(body.address.street).toBe("Quadra 101 Sul");
    expect(body.address.title).toBe("Sede");
    expect(body.address.complement).toBe("Sala 2");
  });
});

import { describe, expect, it } from "vitest";
import {
  createOrganizationBodySchema,
  listOrganizationsQuerySchema,
  organizationParamsSchema,
  updateOrganizationBodySchema,
} from "./organization-schemas.js";

const validBody = {
  organization: {
    tradeName: "ABECMED",
    legalName: "Associacao Brasileira de Cannabis Medicinal",
    cnpj: "12.345.678/0001-90",
    primaryCnae: "8630-5/03",
    secondaryCnaes: ["9499-5/00"],
    currentPlanId: "plan-id",
  },
  address: {
    title: "Sede",
    zipcode: "77000-000",
    street: "Rua Exemplo",
    neighborhood: "Centro",
    complement: "Sala 01",
    city: "Palmas",
    state: "to",
  },
};

describe("organization schemas", () => {
  it("accepts a valid create body and normalizes trimmed optional fields and UF", () => {
    const result = createOrganizationBodySchema.safeParse({
      organization: {
        ...validBody.organization,
        tradeName: "  ABECMED  ",
        secondaryCnaes: undefined,
      },
      address: {
        ...validBody.address,
        title: " ",
        complement: " ",
      },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.organization.tradeName).toBe("ABECMED");
      expect(result.data.organization.secondaryCnaes).toEqual([]);
      expect(result.data.address.title).toBeNull();
      expect(result.data.address.complement).toBeNull();
      expect(result.data.address.state).toBe("TO");
    }
  });

  it("rejects invalid create body shape, extra fields, blank required fields, and invalid masks", () => {
    expect(createOrganizationBodySchema.safeParse({ organization: validBody.organization }).success).toBe(
      false,
    );
    expect(
      createOrganizationBodySchema.safeParse({
        ...validBody,
        organization: { ...validBody.organization, tradeName: " " },
      }).success,
    ).toBe(false);
    expect(
      createOrganizationBodySchema.safeParse({
        ...validBody,
        organization: { ...validBody.organization, cnpj: "12.345" },
      }).success,
    ).toBe(false);
    expect(
      createOrganizationBodySchema.safeParse({
        ...validBody,
        organization: { ...validBody.organization, primaryCnae: "8630" },
      }).success,
    ).toBe(false);
    expect(
      createOrganizationBodySchema.safeParse({
        ...validBody,
        address: { ...validBody.address, zipcode: "77000" },
      }).success,
    ).toBe(false);
    expect(
      createOrganizationBodySchema.safeParse({
        ...validBody,
        address: { ...validBody.address, state: "XX" },
      }).success,
    ).toBe(false);
    expect(createOrganizationBodySchema.safeParse({ ...validBody, extra: "field" }).success).toBe(
      false,
    );
  });

  it("accepts nonblank params IDs and rejects blank IDs", () => {
    expect(organizationParamsSchema.safeParse({ id: "organization-1" }).success).toBe(true);
    expect(organizationParamsSchema.safeParse({ id: " " }).success).toBe(false);
  });

  it("keeps list query empty for v1 and rejects unknown filters", () => {
    expect(listOrganizationsQuerySchema.safeParse({}).success).toBe(true);
    expect(listOrganizationsQuerySchema.safeParse({ search: "ABECMED" }).success).toBe(false);
  });

  it("requires a full update body and rejects partial updates", () => {
    expect(updateOrganizationBodySchema.safeParse(validBody).success).toBe(true);
    expect(
      updateOrganizationBodySchema.safeParse({
        organization: {
          tradeName: "Novo nome fantasia",
        },
        address: validBody.address,
      }).success,
    ).toBe(false);
  });

  it("allows null optional address fields on update", () => {
    expect(
      updateOrganizationBodySchema.safeParse({
        ...validBody,
        address: {
          ...validBody.address,
          title: null,
          complement: null,
        },
      }).success,
    ).toBe(true);
  });
});

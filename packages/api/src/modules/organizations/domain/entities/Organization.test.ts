import { describe, expect, it } from "vitest";
import { Organization } from "./Organization.js";
import { Cnpj } from "../value-objects/Cnpj.js";
import { Cnae } from "../value-objects/Cnae.js";
import { AggregateRoot } from "../../../../shared/domain/entities/AggregateRoot.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

const baseProps = {
  slug: "flora-assoc",
  tradeName: "Flora Assoc",
  legalName: "Flora Associação LTDA",
  cnpj: Cnpj.create("11.222.333/0001-81"),
  primaryCnae: Cnae.create("8630-5/03"),
  secondaryCnaes: [],
  currentPlanId: "plan-1",
  addressId: "address-1",
};

describe("Organization", () => {
  it("rejects an empty tradeName", () => {
    expect(() => Organization.create({ ...baseProps, tradeName: "  " })).toThrow(
      DomainValidationError,
    );
  });

  it("rejects an empty legalName", () => {
    expect(() => Organization.create({ ...baseProps, legalName: "" })).toThrow(
      DomainValidationError,
    );
  });

  it("requires a currentPlanId", () => {
    expect(() => Organization.create({ ...baseProps, currentPlanId: "" })).toThrow(
      DomainValidationError,
    );
  });

  it("requires an addressId", () => {
    expect(() => Organization.create({ ...baseProps, addressId: "" })).toThrow(
      DomainValidationError,
    );
  });

  it("rejects an invalid slug", () => {
    expect(() => Organization.create({ ...baseProps, slug: "Flora Assoc!" })).toThrow(
      DomainValidationError,
    );
  });

  it("creates a valid organization", () => {
    const organization = Organization.create({
      ...baseProps,
      currentPlanId: "plan-1",
      addressId: "address-1",
    });

    expect(organization).toBeInstanceOf(AggregateRoot);
    expect(organization.slug).toBe("flora-assoc");
    expect(organization.tradeName).toBe("Flora Assoc");
    expect(organization.cnpj.value).toBe("11222333000181");
    expect(organization.primaryCnae.value).toBe("8630503");
    expect(organization.currentPlanId).toBe("plan-1");
    expect(organization.addressId).toBe("address-1");
  });
});

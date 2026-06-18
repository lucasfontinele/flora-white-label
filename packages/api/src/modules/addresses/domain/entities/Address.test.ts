import { describe, expect, it } from "vitest";
import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { Address } from "./Address.js";

const baseInput = {
  title: "  Sede  ",
  zipcode: "01001-000",
  street: "  Praca da Se  ",
  neighborhood: "  Se  ",
  complement: "  Sala 01  ",
  city: "  Sao Paulo  ",
  state: "sp",
};

describe("Address", () => {
  it("creates a persistable entity with normalized address data", () => {
    const address = Address.create(baseInput, "address-1");

    expect(address).toBeInstanceOf(Entity);
    expect(address.id).toBe("address-1");
    expect(address.title).toBe("Sede");
    expect(address.zipcode).toBe("01001000");
    expect(address.street).toBe("Praca da Se");
    expect(address.neighborhood).toBe("Se");
    expect(address.complement).toBe("Sala 01");
    expect(address.city).toBe("Sao Paulo");
    expect(address.state).toBe("SP");
  });

  it("stores blank optional title and complement as null", () => {
    const address = Address.create({
      ...baseInput,
      title: " ",
      complement: " ",
    });

    expect(address.title).toBeNull();
    expect(address.complement).toBeNull();
  });

  it("requires an exact 8-digit zipcode", () => {
    expect(() => Address.create({ ...baseInput, zipcode: "" })).toThrow(DomainValidationError);
    expect(() => Address.create({ ...baseInput, zipcode: "01001" })).toThrow(
      DomainValidationError,
    );
    expect(() => Address.create({ ...baseInput, zipcode: "010010001" })).toThrow(
      DomainValidationError,
    );
  });

  it("requires street, neighborhood, and city", () => {
    expect(() => Address.create({ ...baseInput, street: " " })).toThrow(DomainValidationError);
    expect(() => Address.create({ ...baseInput, neighborhood: " " })).toThrow(
      DomainValidationError,
    );
    expect(() => Address.create({ ...baseInput, city: " " })).toThrow(DomainValidationError);
  });

  it("requires a valid Brazilian UF", () => {
    expect(() => Address.create({ ...baseInput, state: "XX" })).toThrow(DomainValidationError);
  });
});

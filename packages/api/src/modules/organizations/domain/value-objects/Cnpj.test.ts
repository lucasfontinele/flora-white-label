import { describe, expect, it } from "vitest";
import { Cnpj } from "./Cnpj.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

describe("Cnpj", () => {
  it("accepts a valid CNPJ and stores digits only", () => {
    expect(Cnpj.create("11.222.333/0001-81").value).toBe("11222333000181");
  });

  it("accepts a valid unmasked CNPJ", () => {
    expect(Cnpj.create("11222333000181").value).toBe("11222333000181");
  });

  it("rejects a CNPJ with invalid check digits", () => {
    expect(() => Cnpj.create("11.222.333/0001-00")).toThrow(DomainValidationError);
  });

  it("rejects a CNPJ formed by repeated digits", () => {
    expect(() => Cnpj.create("00000000000000")).toThrow(DomainValidationError);
  });

  it("rejects an empty CNPJ", () => {
    expect(() => Cnpj.create("")).toThrow(DomainValidationError);
  });
});

import { describe, expect, it } from "vitest";
import { Cnae } from "./Cnae.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

describe("Cnae", () => {
  it("accepts a masked CNAE and stores 7 digits", () => {
    expect(Cnae.create("8630-5/03").value).toBe("8630503");
  });

  it("accepts an unmasked CNAE", () => {
    expect(Cnae.create("8630503").value).toBe("8630503");
  });

  it("accepts any structurally valid 7-digit CNAE without official lookup", () => {
    expect(Cnae.create("9999-9/99").value).toBe("9999999");
  });

  it("rejects a CNAE without exactly 7 digits", () => {
    expect(() => Cnae.create("8630")).toThrow(DomainValidationError);
    expect(() => Cnae.create("86305031")).toThrow(DomainValidationError);
  });

  it("rejects an empty CNAE", () => {
    expect(() => Cnae.create("")).toThrow(DomainValidationError);
  });
});

import { describe, expect, it } from "vitest";
import {
  formatBrazilianPhone,
  formatCep,
  formatCnae,
  formatCnpj,
  formatUf,
  isValidCnae,
  normalizeCnae,
  onlyDigits,
} from "./masks";

describe("masks", () => {
  it("keeps only digits when normalizing numeric fields", () => {
    expect(onlyDigits("11.222.333/0001-81")).toBe("11222333000181");
  });

  it("formats institutional fields", () => {
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
    expect(formatCep("77001000")).toBe("77001-000");
    expect(formatUf("to1")).toBe("TO");
  });

  it("formats Brazilian mobile and landline phones", () => {
    expect(formatBrazilianPhone("63999990000")).toBe("(63) 99999-0000");
    expect(formatBrazilianPhone("6333330000")).toBe("(63) 3333-0000");
  });

  it("formats and validates CNAE values", () => {
    expect(formatCnae("9499500")).toBe("9499-5/00");
    expect(normalizeCnae("9499-5/00")).toBe("9499500");
    expect(isValidCnae("9499-5/00")).toBe(true);
    expect(isValidCnae("9499-5/00 Comercio")).toBe(false);
  });
});

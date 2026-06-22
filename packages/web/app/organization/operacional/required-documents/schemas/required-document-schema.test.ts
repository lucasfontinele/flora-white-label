import { describe, expect, it } from "vitest";
import { requiredDocumentFormSchema } from "./required-document-schema";

describe("requiredDocumentFormSchema", () => {
  it("accepts a name and trims it, with empty observations allowed", () => {
    const parsed = requiredDocumentFormSchema.safeParse({ name: " Receita médica ", observations: "" });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Receita médica");
      expect(parsed.data.observations).toBe("");
    }
  });

  it("trims provided observations", () => {
    const parsed = requiredDocumentFormSchema.safeParse({
      name: "Receita médica",
      observations: "  Trazer a via original.  ",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.observations).toBe("Trazer a via original.");
    }
  });

  it("rejects a blank name", () => {
    expect(requiredDocumentFormSchema.safeParse({ name: "   ", observations: "" }).success).toBe(false);
  });

  it("rejects a name longer than 120 characters", () => {
    expect(
      requiredDocumentFormSchema.safeParse({ name: "a".repeat(121), observations: "" }).success,
    ).toBe(false);
  });

  it("rejects observations longer than 500 characters", () => {
    expect(
      requiredDocumentFormSchema.safeParse({ name: "Receita", observations: "a".repeat(501) }).success,
    ).toBe(false);
  });
});

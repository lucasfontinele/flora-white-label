import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { OrganizationRequiredDocument } from "./OrganizationRequiredDocument.js";

describe("OrganizationRequiredDocument", () => {
  it("creates a required document configuration with trimmed values", () => {
    const document = OrganizationRequiredDocument.create({
      organizationId: " org-1 ",
      name: " Receita medica ",
    });

    expect(document.id).toEqual(expect.any(String));
    expect(document.organizationId).toBe("org-1");
    expect(document.name).toBe("Receita medica");
  });

  it("rejects an empty organization id", () => {
    expect(() =>
      OrganizationRequiredDocument.create({ organizationId: " ", name: "Receita medica" }),
    ).toThrow(DomainValidationError);
  });

  it("rejects an empty name", () => {
    expect(() =>
      OrganizationRequiredDocument.create({ organizationId: "org-1", name: " " }),
    ).toThrow(DomainValidationError);
  });

  it("keeps observations null when absent, null, or blank", () => {
    expect(
      OrganizationRequiredDocument.create({ organizationId: "org-1", name: "Doc" }).observations,
    ).toBeNull();
    expect(
      OrganizationRequiredDocument.create({ organizationId: "org-1", name: "Doc", observations: null })
        .observations,
    ).toBeNull();
    expect(
      OrganizationRequiredDocument.create({ organizationId: "org-1", name: "Doc", observations: "   " })
        .observations,
    ).toBeNull();
  });

  it("trims a provided observation", () => {
    const document = OrganizationRequiredDocument.create({
      organizationId: "org-1",
      name: "Doc",
      observations: "  Trazer a via original.  ",
    });

    expect(document.observations).toBe("Trazer a via original.");
  });

  it("does not expose file metadata", () => {
    const document = OrganizationRequiredDocument.create({
      organizationId: "org-1",
      name: "Documento pessoal",
    });

    expect("fileUrl" in document).toBe(false);
    expect("storageKey" in document).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { CreateOrganizationRequiredDocumentUseCase } from "./CreateOrganizationRequiredDocumentUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryOrganizationRepository,
  InMemoryRequiredDocumentRepository,
} from "./organization-document-use-case-test-utils.js";

function makeSut() {
  const organizationRepository = new InMemoryOrganizationRepository();
  const requiredDocumentRepository = new InMemoryRequiredDocumentRepository();
  organizationRepository.add("org-1");
  const useCase = new CreateOrganizationRequiredDocumentUseCase({
    organizationRepository,
    requiredDocumentRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { organizationRepository, requiredDocumentRepository, useCase };
}

describe("CreateOrganizationRequiredDocumentUseCase", () => {
  it("creates a required document for an organization", async () => {
    const { requiredDocumentRepository, useCase } = makeSut();

    const output = await useCase.execute({ organizationId: "org-1", name: " Receita medica " });

    expect(output.id).toEqual(expect.any(String));
    expect(output.organizationId).toBe("org-1");
    expect(output.name).toBe("Receita medica");
    expect(requiredDocumentRepository.documents.size).toBe(1);
  });

  it("stores trimmed observations and defaults to null when omitted", async () => {
    const { useCase } = makeSut();

    const withObservations = await useCase.execute({
      organizationId: "org-1",
      name: "Receita medica",
      observations: "  Trazer duas vias.  ",
    });
    expect(withObservations.observations).toBe("Trazer duas vias.");

    const withoutObservations = await useCase.execute({ organizationId: "org-1", name: "Laudo" });
    expect(withoutObservations.observations).toBeNull();
  });

  it("blocks duplicate names in the same organization", async () => {
    const { useCase, requiredDocumentRepository } = makeSut();
    requiredDocumentRepository.seed({ id: "doc-1", organizationId: "org-1", name: "Receita medica" });

    await expect(
      useCase.execute({ organizationId: "org-1", name: "Receita medica" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("allows same names in different organizations", async () => {
    const { organizationRepository, useCase, requiredDocumentRepository } = makeSut();
    organizationRepository.add("org-2");
    requiredDocumentRepository.seed({ id: "doc-1", organizationId: "org-1", name: "Receita medica" });

    const output = await useCase.execute({ organizationId: "org-2", name: "Receita medica" });

    expect(output.organizationId).toBe("org-2");
  });

  it("fails when organization does not exist", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ organizationId: "missing", name: "Receita medica" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

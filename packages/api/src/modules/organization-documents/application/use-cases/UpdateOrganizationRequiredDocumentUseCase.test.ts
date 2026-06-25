import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { UpdateOrganizationRequiredDocumentUseCase } from "./UpdateOrganizationRequiredDocumentUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryRequiredDocumentRepository,
} from "./organization-document-use-case-test-utils.js";

function makeSut() {
  const requiredDocumentRepository = new InMemoryRequiredDocumentRepository();
  requiredDocumentRepository.seed({ id: "doc-1", organizationId: "org-1", name: "Receita medica" });
  const useCase = new UpdateOrganizationRequiredDocumentUseCase({
    requiredDocumentRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { requiredDocumentRepository, useCase };
}

describe("UpdateOrganizationRequiredDocumentUseCase", () => {
  it("updates the document name", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      organizationId: "org-1",
      documentId: "doc-1",
      name: " Laudo medico ",
    });

    expect(output.id).toBe("doc-1");
    expect(output.name).toBe("Laudo medico");
  });

  it("updates observations and clears them when omitted", async () => {
    const { useCase } = makeSut();

    const updated = await useCase.execute({
      organizationId: "org-1",
      documentId: "doc-1",
      name: "Receita medica",
      observations: "  Levar receita azul.  ",
    });
    expect(updated.observations).toBe("Levar receita azul.");

    const cleared = await useCase.execute({
      organizationId: "org-1",
      documentId: "doc-1",
      name: "Receita medica",
    });
    expect(cleared.observations).toBeNull();
  });

  it("fails when document does not exist in the organization", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ organizationId: "org-2", documentId: "doc-1", name: "Laudo medico" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("blocks duplicate target name in same organization", async () => {
    const { requiredDocumentRepository, useCase } = makeSut();
    requiredDocumentRepository.seed({ id: "doc-2", organizationId: "org-1", name: "Laudo medico" });

    await expect(
      useCase.execute({ organizationId: "org-1", documentId: "doc-1", name: "Laudo medico" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

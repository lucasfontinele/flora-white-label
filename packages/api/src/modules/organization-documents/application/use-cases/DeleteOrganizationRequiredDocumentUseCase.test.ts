import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DeleteOrganizationRequiredDocumentUseCase } from "./DeleteOrganizationRequiredDocumentUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryRequiredDocumentRepository,
} from "./organization-document-use-case-test-utils.js";

function makeSut() {
  const requiredDocumentRepository = new InMemoryRequiredDocumentRepository();
  requiredDocumentRepository.seed({ id: "doc-1", organizationId: "org-1", name: "Receita medica" });
  const useCase = new DeleteOrganizationRequiredDocumentUseCase({
    requiredDocumentRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { requiredDocumentRepository, useCase };
}

describe("DeleteOrganizationRequiredDocumentUseCase", () => {
  it("deletes an unused document in the organization", async () => {
    const { requiredDocumentRepository, useCase } = makeSut();

    await useCase.execute({ organizationId: "org-1", documentId: "doc-1" });

    expect(requiredDocumentRepository.documents.has("doc-1")).toBe(false);
    expect(requiredDocumentRepository.deleteCalls).toBe(1);
  });

  it("fails when document is not found", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ organizationId: "org-1", documentId: "missing" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("blocks deleting a document with linked approvals", async () => {
    const { requiredDocumentRepository, useCase } = makeSut();
    requiredDocumentRepository.approvalDocumentIds.add("doc-1");

    await expect(
      useCase.execute({ organizationId: "org-1", documentId: "doc-1" }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(requiredDocumentRepository.deleteCalls).toBe(0);
  });
});

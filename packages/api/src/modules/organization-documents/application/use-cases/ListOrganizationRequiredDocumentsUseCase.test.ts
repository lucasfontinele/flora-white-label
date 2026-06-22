import { describe, expect, it } from "vitest";
import { ListOrganizationRequiredDocumentsUseCase } from "./ListOrganizationRequiredDocumentsUseCase.js";
import { InMemoryRequiredDocumentRepository } from "./organization-document-use-case-test-utils.js";

describe("ListOrganizationRequiredDocumentsUseCase", () => {
  it("lists only documents from the requested organization", async () => {
    const requiredDocumentRepository = new InMemoryRequiredDocumentRepository();
    requiredDocumentRepository.seed({ id: "doc-1", organizationId: "org-1", name: "Receita medica" });
    requiredDocumentRepository.seed({ id: "doc-2", organizationId: "org-2", name: "Receita medica" });
    const useCase = new ListOrganizationRequiredDocumentsUseCase(requiredDocumentRepository);

    const output = await useCase.execute({ organizationId: "org-1" });

    expect(output.data).toHaveLength(1);
    expect(output.data[0]?.id).toBe("doc-1");
  });
});

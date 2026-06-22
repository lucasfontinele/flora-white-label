import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DocumentApprovalStatus } from "../../domain/enums/DocumentApprovalStatus.js";
import { CreatePatientDocumentApprovalUseCase } from "./CreatePatientDocumentApprovalUseCase.js";
import {
  InMemoryApprovalRepository,
  InMemoryOrganizationRepository,
  InMemoryPatientRepository,
  InMemoryRequiredDocumentRepository,
} from "./organization-document-use-case-test-utils.js";

function makeSut() {
  const organizationRepository = new InMemoryOrganizationRepository();
  const patientRepository = new InMemoryPatientRepository();
  const requiredDocumentRepository = new InMemoryRequiredDocumentRepository();
  const approvalRepository = new InMemoryApprovalRepository();
  organizationRepository.add("org-1");
  patientRepository.add("org-1", "patient-1");
  requiredDocumentRepository.seed({ id: "doc-1", organizationId: "org-1", name: "Receita medica" });
  approvalRepository.documentOrganizations.set("doc-1", "org-1");
  const useCase = new CreatePatientDocumentApprovalUseCase({
    organizationRepository,
    patientRepository,
    requiredDocumentRepository,
    approvalRepository,
  });

  return {
    approvalRepository,
    organizationRepository,
    patientRepository,
    requiredDocumentRepository,
    useCase,
  };
}

describe("CreatePatientDocumentApprovalUseCase", () => {
  it("creates a pending approval with null rejected reason", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      documentId: "doc-1",
    });

    expect(output.organizationId).toBe("org-1");
    expect(output.status).toBe(DocumentApprovalStatus.Pending);
    expect(output.rejectedReason).toBeNull();
  });

  it("blocks duplicate approvals by document and patient", async () => {
    const { approvalRepository, useCase } = makeSut();
    approvalRepository.seed({
      id: "approval-1",
      documentId: "doc-1",
      patientId: "patient-1",
      organizationId: "org-1",
    });

    await expect(
      useCase.execute({ organizationId: "org-1", patientId: "patient-1", documentId: "doc-1" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("fails when document does not belong to the route organization", async () => {
    const { requiredDocumentRepository, useCase } = makeSut();
    requiredDocumentRepository.seed({ id: "doc-2", organizationId: "org-2", name: "Laudo medico" });

    await expect(
      useCase.execute({ organizationId: "org-1", patientId: "patient-1", documentId: "doc-2" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("fails when patient does not belong to the route organization", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ organizationId: "org-1", patientId: "patient-2", documentId: "doc-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

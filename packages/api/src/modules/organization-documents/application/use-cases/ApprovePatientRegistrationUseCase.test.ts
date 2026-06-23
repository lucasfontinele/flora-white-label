import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import { DocumentApprovalStatus } from "../../domain/enums/DocumentApprovalStatus.js";
import { ApprovePatientRegistrationUseCase } from "./ApprovePatientRegistrationUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryApprovalRepository,
  InMemoryPatientRepository,
  InMemoryRequiredDocumentRepository,
} from "./organization-document-use-case-test-utils.js";

function makeSut() {
  const patientRepository = new InMemoryPatientRepository();
  const requiredDocumentRepository = new InMemoryRequiredDocumentRepository();
  const approvalRepository = new InMemoryApprovalRepository();
  patientRepository.add("org-1", "patient-1");
  requiredDocumentRepository.seed({ id: "doc-1", organizationId: "org-1", name: "Receita" });
  const useCase = new ApprovePatientRegistrationUseCase({
    patientRepository,
    requiredDocumentRepository,
    approvalRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { patientRepository, requiredDocumentRepository, approvalRepository, useCase };
}

describe("ApprovePatientRegistrationUseCase", () => {
  it("approves the registration when every required document is approved", async () => {
    const sut = makeSut();
    sut.approvalRepository.seed({
      id: "ap-1",
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
      status: DocumentApprovalStatus.Approved,
    });

    const output = await sut.useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.patientStatus).toBe(PatientStatus.Approval);
    expect(output.rejectionReason).toBeNull();
  });

  it("blocks approval when a required document is still pending", async () => {
    const sut = makeSut();
    sut.approvalRepository.seed({
      id: "ap-1",
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
      status: DocumentApprovalStatus.Pending,
    });

    await expect(
      sut.useCase.execute({ organizationId: "org-1", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("blocks approval when there are no documents uploaded at all", async () => {
    const sut = makeSut();

    await expect(
      sut.useCase.execute({ organizationId: "org-1", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("fails when the patient is not in the organization", async () => {
    const sut = makeSut();

    await expect(
      sut.useCase.execute({ organizationId: "org-2", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

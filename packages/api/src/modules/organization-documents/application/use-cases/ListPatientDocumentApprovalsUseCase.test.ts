import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { ListPatientDocumentApprovalsUseCase } from "./ListPatientDocumentApprovalsUseCase.js";
import {
  InMemoryApprovalRepository,
  InMemoryPatientRepository,
} from "./organization-document-use-case-test-utils.js";

describe("ListPatientDocumentApprovalsUseCase", () => {
  it("lists only approvals for requested organization and patient", async () => {
    const patientRepository = new InMemoryPatientRepository();
    const approvalRepository = new InMemoryApprovalRepository();
    patientRepository.add("org-1", "patient-1");
    approvalRepository.seed({
      id: "approval-1",
      documentId: "doc-1",
      patientId: "patient-1",
      organizationId: "org-1",
    });
    approvalRepository.seed({
      id: "approval-2",
      documentId: "doc-2",
      patientId: "patient-1",
      organizationId: "org-2",
    });
    const useCase = new ListPatientDocumentApprovalsUseCase({ patientRepository, approvalRepository });

    const output = await useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.data).toHaveLength(1);
    expect(output.data[0]?.id).toBe("approval-1");
  });

  it("fails when patient is outside organization", async () => {
    const useCase = new ListPatientDocumentApprovalsUseCase({
      patientRepository: new InMemoryPatientRepository(),
      approvalRepository: new InMemoryApprovalRepository(),
    });

    await expect(
      useCase.execute({ organizationId: "org-1", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

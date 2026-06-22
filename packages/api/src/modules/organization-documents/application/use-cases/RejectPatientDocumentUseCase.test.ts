import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { DocumentApprovalAction } from "../../domain/enums/DocumentApprovalAction.js";
import { DocumentApprovalStatus } from "../../domain/enums/DocumentApprovalStatus.js";
import { RejectPatientDocumentUseCase } from "./RejectPatientDocumentUseCase.js";
import {
  InMemoryApprovalLogRepository,
  InMemoryApprovalRepository,
  SpyUnitOfWork,
} from "./organization-document-use-case-test-utils.js";

function makeSut() {
  const approvalRepository = new InMemoryApprovalRepository();
  const logRepository = new InMemoryApprovalLogRepository();
  const unitOfWork = new SpyUnitOfWork();
  approvalRepository.seed({
    id: "approval-1",
    documentId: "doc-1",
    patientId: "patient-1",
    organizationId: "org-1",
  });
  const useCase = new RejectPatientDocumentUseCase({ approvalRepository, logRepository, unitOfWork });

  return { approvalRepository, logRepository, unitOfWork, useCase };
}

describe("RejectPatientDocumentUseCase", () => {
  it("rejects with required reason and appends one log", async () => {
    const { logRepository, useCase } = makeSut();

    const output = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      approvalId: "approval-1",
      organizationUserId: "user-1",
      rejectedReason: " Documento ilegivel. ",
    });

    expect(output.status).toBe(DocumentApprovalStatus.Rejected);
    expect(output.rejectedReason).toBe("Documento ilegivel.");
    expect(logRepository.logs).toHaveLength(1);
    expect(logRepository.logs[0]?.action).toBe(DocumentApprovalAction.RejectedDocument);
  });

  it("requires rejected reason and creates no log when invalid", async () => {
    const { logRepository, useCase } = makeSut();

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        approvalId: "approval-1",
        organizationUserId: "user-1",
        rejectedReason: " ",
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    expect(logRepository.logs).toHaveLength(0);
  });
});

import { describe, expect, it } from "vitest";
import { DocumentApprovalAction } from "../../domain/enums/DocumentApprovalAction.js";
import { DocumentApprovalStatus } from "../../domain/enums/DocumentApprovalStatus.js";
import { ApprovePatientDocumentUseCase } from "./ApprovePatientDocumentUseCase.js";
import {
  InMemoryApprovalLogRepository,
  InMemoryApprovalRepository,
  SpyUnitOfWork,
} from "./organization-document-use-case-test-utils.js";

describe("ApprovePatientDocumentUseCase", () => {
  it("approves, clears rejected reason, and appends one log in a unit of work", async () => {
    const approvalRepository = new InMemoryApprovalRepository();
    const logRepository = new InMemoryApprovalLogRepository();
    const unitOfWork = new SpyUnitOfWork();
    approvalRepository.seed({
      id: "approval-1",
      documentId: "doc-1",
      patientId: "patient-1",
      organizationId: "org-1",
      status: DocumentApprovalStatus.Rejected,
      rejectedReason: "Ilegivel",
    });
    const useCase = new ApprovePatientDocumentUseCase({
      approvalRepository,
      logRepository,
      unitOfWork,
    });

    const output = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      approvalId: "approval-1",
      organizationUserId: "user-1",
    });

    expect(output.status).toBe(DocumentApprovalStatus.Approved);
    expect(output.rejectedReason).toBeNull();
    expect(logRepository.logs).toHaveLength(1);
    expect(logRepository.logs[0]?.action).toBe(DocumentApprovalAction.ApprovedDocument);
    expect(unitOfWork.executions).toBe(1);
  });
});

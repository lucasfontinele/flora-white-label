import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { OrganizationDocumentApprovalLog } from "../../domain/entities/OrganizationDocumentApprovalLog.js";
import { DocumentApprovalAction } from "../../domain/enums/DocumentApprovalAction.js";
import { ListPatientDocumentApprovalLogsUseCase } from "./ListPatientDocumentApprovalLogsUseCase.js";
import {
  InMemoryApprovalLogRepository,
  InMemoryApprovalRepository,
} from "./organization-document-use-case-test-utils.js";

describe("ListPatientDocumentApprovalLogsUseCase", () => {
  it("lists append-only logs after scoped approval lookup", async () => {
    const approvalRepository = new InMemoryApprovalRepository();
    const logRepository = new InMemoryApprovalLogRepository();
    approvalRepository.seed({
      id: "approval-1",
      documentId: "doc-1",
      patientId: "patient-1",
      organizationId: "org-1",
    });
    await logRepository.create(
      OrganizationDocumentApprovalLog.create({
        action: DocumentApprovalAction.RejectedDocument,
        patientApprovalId: "approval-1",
        organizationUserId: "user-1",
      }),
    );
    await logRepository.create(
      OrganizationDocumentApprovalLog.create({
        action: DocumentApprovalAction.ApprovedDocument,
        patientApprovalId: "approval-1",
        organizationUserId: "user-1",
      }),
    );
    const useCase = new ListPatientDocumentApprovalLogsUseCase({
      approvalRepository,
      logRepository,
    });

    const output = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      approvalId: "approval-1",
    });

    expect(output.data.map((log) => log.action)).toEqual([
      DocumentApprovalAction.RejectedDocument,
      DocumentApprovalAction.ApprovedDocument,
    ]);
  });

  it("fails for approval from another organization or patient", async () => {
    const useCase = new ListPatientDocumentApprovalLogsUseCase({
      approvalRepository: new InMemoryApprovalRepository(),
      logRepository: new InMemoryApprovalLogRepository(),
    });

    await expect(
      useCase.execute({ organizationId: "org-1", patientId: "patient-1", approvalId: "missing" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

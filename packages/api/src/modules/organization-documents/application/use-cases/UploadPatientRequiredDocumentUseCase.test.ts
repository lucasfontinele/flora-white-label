import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DocumentApprovalAction } from "../../domain/enums/DocumentApprovalAction.js";
import { DocumentApprovalStatus } from "../../domain/enums/DocumentApprovalStatus.js";
import type {
  DocumentStorageService,
  UploadDocumentInput,
  UploadDocumentOutput,
} from "../services/DocumentStorageService.js";
import {
  InMemoryApprovalLogRepository,
  InMemoryApprovalRepository,
  InMemoryOrganizationRepository,
  InMemoryPatientRepository,
  InMemoryRequiredDocumentRepository,
  SpyUnitOfWork,
} from "./organization-document-use-case-test-utils.js";
import { UploadPatientRequiredDocumentUseCase } from "./UploadPatientRequiredDocumentUseCase.js";

class FakeDocumentStorageService implements DocumentStorageService {
  uploads: UploadDocumentInput[] = [];
  shouldFailUpload = false;

  async upload(input: UploadDocumentInput): Promise<UploadDocumentOutput> {
    if (this.shouldFailUpload) {
      throw new Error("Storage unavailable.");
    }

    this.uploads.push(input);
    return { storageKey: input.storageKey, mimeType: input.mimeType, size: input.size };
  }

  async getDownloadUrl(storageKey: string): Promise<string> {
    return `https://signed.local/${storageKey}`;
  }
}

function makeSut() {
  const organizationRepository = new InMemoryOrganizationRepository();
  const patientRepository = new InMemoryPatientRepository();
  const requiredDocumentRepository = new InMemoryRequiredDocumentRepository();
  const approvalRepository = new InMemoryApprovalRepository();
  const logRepository = new InMemoryApprovalLogRepository();
  const storageService = new FakeDocumentStorageService();
  const unitOfWork = new SpyUnitOfWork();

  organizationRepository.add("org-1");
  patientRepository.add("org-1", "patient-1");
  requiredDocumentRepository.seed({ id: "doc-1", organizationId: "org-1", name: "Receita medica" });

  const useCase = new UploadPatientRequiredDocumentUseCase({
    organizationRepository,
    patientRepository,
    requiredDocumentRepository,
    approvalRepository,
    logRepository,
    storageService,
    unitOfWork,
    now: () => new Date("2026-06-22T15:00:00.000Z"),
  });

  return {
    approvalRepository,
    logRepository,
    requiredDocumentRepository,
    storageService,
    unitOfWork,
    useCase,
  };
}

const file = {
  fileName: "Receita médica.pdf",
  mimeType: "application/pdf",
  size: 128,
  content: new Uint8Array([1, 2, 3]),
};

describe("UploadPatientRequiredDocumentUseCase", () => {
  it("creates the approval on first upload and stores the file as pending", async () => {
    const sut = makeSut();

    const output = await sut.useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      documentId: "doc-1",
      ...file,
      performedByUserId: "patient-user-1",
    });

    expect(sut.approvalRepository.approvals.size).toBe(1);
    expect(sut.storageService.uploads).toHaveLength(1);
    expect(sut.storageService.uploads[0]?.storageKey).toMatch(
      /^organizations\/org-1\/patients\/patient-1\/documents\/.+\/1782140400000-Receita-m-dica\.pdf$/,
    );
    expect(output.organizationId).toBe("org-1");
    expect(output.documentId).toBe("doc-1");
    expect(output.patientId).toBe("patient-1");
    expect(output.status).toBe(DocumentApprovalStatus.Pending);
    expect(output.fileName).toBe("Receita médica.pdf");
    expect(output.storageKey).toBe(sut.storageService.uploads[0]?.storageKey);
    expect(sut.logRepository.logs).toMatchObject([
      { action: DocumentApprovalAction.UploadedDocument, organizationUserId: "patient-user-1" },
    ]);
    expect(sut.unitOfWork.executions).toBe(1);
  });

  it("reuses the existing approval and moves a rejected document back to pending", async () => {
    const sut = makeSut();
    sut.approvalRepository.seed({
      id: "approval-1",
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
      status: DocumentApprovalStatus.Rejected,
      rejectedReason: "Documento ilegivel.",
    });

    const output = await sut.useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      documentId: "doc-1",
      ...file,
    });

    expect(sut.approvalRepository.approvals.size).toBe(1);
    expect(output.id).toBe("approval-1");
    expect(output.status).toBe(DocumentApprovalStatus.Pending);
    expect(output.rejectedReason).toBeNull();
    expect(output.fileName).toBe("Receita médica.pdf");
    // Falls back to the patient id as audit actor when no uploader id is given.
    expect(sut.logRepository.logs[0]?.organizationUserId).toBe("patient-1");
  });

  it("fails when the required document does not belong to the organization", async () => {
    const sut = makeSut();

    await expect(
      sut.useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        documentId: "missing-doc",
        ...file,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(sut.storageService.uploads).toHaveLength(0);
    expect(sut.logRepository.logs).toHaveLength(0);
    expect(sut.unitOfWork.executions).toBe(0);
  });

  it("does not persist the approval or log when storage upload fails", async () => {
    const sut = makeSut();
    sut.storageService.shouldFailUpload = true;

    await expect(
      sut.useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        documentId: "doc-1",
        ...file,
      }),
    ).rejects.toThrow("Storage unavailable.");

    expect(sut.approvalRepository.approvals.size).toBe(0);
    expect(sut.logRepository.logs).toHaveLength(0);
    expect(sut.unitOfWork.executions).toBe(0);
  });
});

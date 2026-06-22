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
  SpyUnitOfWork,
} from "./organization-document-use-case-test-utils.js";
import { UploadPatientDocumentUseCase } from "./UploadPatientDocumentUseCase.js";

class FakeDocumentStorageService implements DocumentStorageService {
  uploads: UploadDocumentInput[] = [];
  downloadUrls = new Map<string, string>();
  shouldFailUpload = false;

  async upload(input: UploadDocumentInput): Promise<UploadDocumentOutput> {
    if (this.shouldFailUpload) {
      throw new Error("Storage unavailable.");
    }

    this.uploads.push(input);
    return {
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      size: input.size,
    };
  }

  async getDownloadUrl(storageKey: string): Promise<string> {
    return this.downloadUrls.get(storageKey) ?? `https://signed.local/${storageKey}`;
  }
}

function makeSut() {
  const approvalRepository = new InMemoryApprovalRepository();
  const logRepository = new InMemoryApprovalLogRepository();
  const storageService = new FakeDocumentStorageService();
  const unitOfWork = new SpyUnitOfWork();
  const useCase = new UploadPatientDocumentUseCase({
    approvalRepository,
    logRepository,
    storageService,
    unitOfWork,
    now: () => new Date("2026-06-22T15:00:00.000Z"),
  });

  return {
    approvalRepository,
    logRepository,
    storageService,
    unitOfWork,
    useCase,
  };
}

describe("UploadPatientDocumentUseCase", () => {
  it("uploads file, saves metadata, resets status, and appends upload log", async () => {
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
      approvalId: "approval-1",
      fileName: "Receita médica.pdf",
      mimeType: "application/pdf",
      size: 128,
      content: new Uint8Array([1, 2, 3]),
      performedByUserId: "patient-user-1",
    });

    expect(sut.storageService.uploads).toHaveLength(1);
    expect(sut.storageService.uploads[0]?.storageKey).toBe(
      "organizations/org-1/patients/patient-1/documents/approval-1/1782140400000-Receita-m-dica.pdf",
    );
    expect(output.status).toBe(DocumentApprovalStatus.Pending);
    expect(output.rejectedReason).toBeNull();
    expect(output.fileName).toBe("Receita médica.pdf");
    expect(output.mimeType).toBe("application/pdf");
    expect(output.size).toBe(128);
    expect(output.storageKey).toBe(sut.storageService.uploads[0]?.storageKey);
    expect(sut.logRepository.logs).toMatchObject([
      {
        action: DocumentApprovalAction.UploadedDocument,
        patientApprovalId: "approval-1",
        organizationUserId: "patient-user-1",
      },
    ]);
    expect(sut.unitOfWork.executions).toBe(1);
  });

  it("uses patient id as audit actor when no uploader user id is available", async () => {
    const sut = makeSut();
    sut.approvalRepository.seed({
      id: "approval-1",
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
    });

    await sut.useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      approvalId: "approval-1",
      fileName: "receita.pdf",
      mimeType: "application/pdf",
      size: 128,
      content: new Uint8Array([1]),
    });

    expect(sut.logRepository.logs[0]?.organizationUserId).toBe("patient-1");
  });

  it("does not upload when scoped approval is not found", async () => {
    const sut = makeSut();
    sut.approvalRepository.seed({
      id: "approval-1",
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
    });

    await expect(
      sut.useCase.execute({
        organizationId: "org-2",
        patientId: "patient-1",
        approvalId: "approval-1",
        fileName: "receita.pdf",
        mimeType: "application/pdf",
        size: 128,
        content: new Uint8Array([1]),
      }),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(sut.storageService.uploads).toHaveLength(0);
    expect(sut.logRepository.logs).toHaveLength(0);
    expect(sut.unitOfWork.executions).toBe(0);
  });

  it("does not save metadata or log when storage upload fails", async () => {
    const sut = makeSut();
    sut.storageService.shouldFailUpload = true;
    sut.approvalRepository.seed({
      id: "approval-1",
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
    });

    await expect(
      sut.useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        approvalId: "approval-1",
        fileName: "receita.pdf",
        mimeType: "application/pdf",
        size: 128,
        content: new Uint8Array([1]),
      }),
    ).rejects.toThrow("Storage unavailable.");

    expect(sut.approvalRepository.approvals.get("approval-1")?.storageKey).toBeNull();
    expect(sut.logRepository.logs).toHaveLength(0);
    expect(sut.unitOfWork.executions).toBe(0);
  });
});


import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { DocumentStorageService } from "../services/DocumentStorageService.js";
import { ListPatientDocumentApprovalsUseCase } from "./ListPatientDocumentApprovalsUseCase.js";
import {
  InMemoryApprovalRepository,
  InMemoryPatientRepository,
} from "./organization-document-use-case-test-utils.js";

class FakeDocumentStorageService implements DocumentStorageService {
  requestedKeys: string[] = [];

  async upload(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async getDownloadUrl(storageKey: string): Promise<string> {
    this.requestedKeys.push(storageKey);
    return `https://signed.local/${storageKey}`;
  }
}

describe("ListPatientDocumentApprovalsUseCase", () => {
  it("lists only approvals for requested organization and patient", async () => {
    const patientRepository = new InMemoryPatientRepository();
    const approvalRepository = new InMemoryApprovalRepository();
    const storageService = new FakeDocumentStorageService();
    patientRepository.add("org-1", "patient-1");
    approvalRepository.seed({
      id: "approval-1",
      documentId: "doc-1",
      patientId: "patient-1",
      organizationId: "org-1",
      storageKey: "organizations/org-1/patients/patient-1/documents/approval-1/1-receita.pdf",
      fileName: "receita.pdf",
      mimeType: "application/pdf",
      size: 128,
    });
    approvalRepository.seed({
      id: "approval-2",
      documentId: "doc-2",
      patientId: "patient-1",
      organizationId: "org-2",
    });
    const useCase = new ListPatientDocumentApprovalsUseCase({
      patientRepository,
      approvalRepository,
      storageService,
    });

    const output = await useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.data).toHaveLength(1);
    expect(output.data[0]?.id).toBe("approval-1");
    expect(output.data[0]?.fileUrl).toBe(
      "https://signed.local/organizations/org-1/patients/patient-1/documents/approval-1/1-receita.pdf",
    );
    expect(storageService.requestedKeys).toEqual([
      "organizations/org-1/patients/patient-1/documents/approval-1/1-receita.pdf",
    ]);
  });

  it("returns null fileUrl and does not call storage for approvals without storage key", async () => {
    const patientRepository = new InMemoryPatientRepository();
    const approvalRepository = new InMemoryApprovalRepository();
    const storageService = new FakeDocumentStorageService();
    patientRepository.add("org-1", "patient-1");
    approvalRepository.seed({
      id: "approval-1",
      documentId: "doc-1",
      patientId: "patient-1",
      organizationId: "org-1",
    });
    const useCase = new ListPatientDocumentApprovalsUseCase({
      patientRepository,
      approvalRepository,
      storageService,
    });

    const output = await useCase.execute({ organizationId: "org-1", patientId: "patient-1" });

    expect(output.data[0]?.fileUrl).toBeNull();
    expect(storageService.requestedKeys).toEqual([]);
  });

  it("fails when patient is outside organization", async () => {
    const storageService = new FakeDocumentStorageService();
    const useCase = new ListPatientDocumentApprovalsUseCase({
      patientRepository: new InMemoryPatientRepository(),
      approvalRepository: new InMemoryApprovalRepository(),
      storageService,
    });

    await expect(
      useCase.execute({ organizationId: "org-1", patientId: "patient-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

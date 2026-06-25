import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { DocumentApprovalAction } from "../enums/DocumentApprovalAction.js";
import { DocumentApprovalStatus } from "../enums/DocumentApprovalStatus.js";
import { OrganizationDocumentPatientApproval } from "./OrganizationDocumentPatientApproval.js";

describe("OrganizationDocumentPatientApproval", () => {
  it("creates a pending approval linked to the organization with null rejected reason", () => {
    const approval = OrganizationDocumentPatientApproval.create({
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
    });

    expect(approval.id).toEqual(expect.any(String));
    expect(approval.organizationId).toBe("org-1");
    expect(approval.status).toBe(DocumentApprovalStatus.Pending);
    expect(approval.rejectedReason).toBeNull();
  });

  it("rejects empty identifiers", () => {
    expect(() =>
      OrganizationDocumentPatientApproval.create({
        organizationId: " ",
        documentId: "doc-1",
        patientId: "patient-1",
      }),
    ).toThrow(DomainValidationError);
    expect(() =>
      OrganizationDocumentPatientApproval.create({
        organizationId: "org-1",
        documentId: " ",
        patientId: "patient-1",
      }),
    ).toThrow(DomainValidationError);
    expect(() =>
      OrganizationDocumentPatientApproval.create({
        organizationId: "org-1",
        documentId: "doc-1",
        patientId: " ",
      }),
    ).toThrow(DomainValidationError);
  });

  it("enforces status and rejected reason invariants on creation", () => {
    expect(() =>
      OrganizationDocumentPatientApproval.create({
        organizationId: "org-1",
        documentId: "doc-1",
        patientId: "patient-1",
        status: DocumentApprovalStatus.Rejected,
      }),
    ).toThrow(DomainValidationError);

    expect(() =>
      OrganizationDocumentPatientApproval.create({
        organizationId: "org-1",
        documentId: "doc-1",
        patientId: "patient-1",
        status: DocumentApprovalStatus.Approved,
        rejectedReason: "Ilegivel",
      }),
    ).toThrow(DomainValidationError);
  });

  it("approves and clears rejected reason", () => {
    const approval = OrganizationDocumentPatientApproval.create({
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
      status: DocumentApprovalStatus.Rejected,
      rejectedReason: "Documento ilegivel.",
    });

    expect(approval.approve()).toBe(DocumentApprovalAction.ApprovedDocument);
    expect(approval.status).toBe(DocumentApprovalStatus.Approved);
    expect(approval.rejectedReason).toBeNull();
  });

  it("rejects with a required trimmed reason", () => {
    const approval = OrganizationDocumentPatientApproval.create({
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
    });

    expect(approval.reject(" Documento ilegivel. ")).toBe(DocumentApprovalAction.RejectedDocument);
    expect(approval.status).toBe(DocumentApprovalStatus.Rejected);
    expect(approval.rejectedReason).toBe("Documento ilegivel.");
    expect(() => approval.reject(" ")).toThrow(DomainValidationError);
  });

  it("resets to pending and clears rejected reason", () => {
    const approval = OrganizationDocumentPatientApproval.create({
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
      status: DocumentApprovalStatus.Rejected,
      rejectedReason: "Documento ilegivel.",
    });

    expect(approval.resetToPending()).toBe(DocumentApprovalAction.ResetDocumentToPending);
    expect(approval.status).toBe(DocumentApprovalStatus.Pending);
    expect(approval.rejectedReason).toBeNull();
  });

  it("attaches uploaded file metadata, resets to pending, and clears rejected reason", () => {
    const approval = OrganizationDocumentPatientApproval.create({
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
      status: DocumentApprovalStatus.Rejected,
      rejectedReason: "Documento ilegivel.",
    });

    expect(
      approval.attachUploadedFile({
        fileName: " receita.pdf ",
        mimeType: " application/pdf ",
        size: 128,
        storageKey: " organizations/org-1/patients/patient-1/documents/approval-1/1-receita.pdf ",
      }),
    ).toBe(DocumentApprovalAction.UploadedDocument);
    expect(approval.status).toBe(DocumentApprovalStatus.Pending);
    expect(approval.rejectedReason).toBeNull();
    expect(approval.fileName).toBe("receita.pdf");
    expect(approval.mimeType).toBe("application/pdf");
    expect(approval.size).toBe(128);
    expect(approval.storageKey).toBe(
      "organizations/org-1/patients/patient-1/documents/approval-1/1-receita.pdf",
    );
  });

  it("rejects invalid uploaded file metadata", () => {
    const approval = OrganizationDocumentPatientApproval.create({
      organizationId: "org-1",
      documentId: "doc-1",
      patientId: "patient-1",
    });

    expect(() =>
      approval.attachUploadedFile({
        fileName: " ",
        mimeType: "application/pdf",
        size: 128,
        storageKey: "key",
      }),
    ).toThrow(DomainValidationError);
    expect(() =>
      approval.attachUploadedFile({
        fileName: "receita.pdf",
        mimeType: " ",
        size: 128,
        storageKey: "key",
      }),
    ).toThrow(DomainValidationError);
    expect(() =>
      approval.attachUploadedFile({
        fileName: "receita.pdf",
        mimeType: "application/pdf",
        size: 0,
        storageKey: "key",
      }),
    ).toThrow(DomainValidationError);
    expect(() =>
      approval.attachUploadedFile({
        fileName: "receita.pdf",
        mimeType: "application/pdf",
        size: 128,
        storageKey: " ",
      }),
    ).toThrow(DomainValidationError);
  });
});

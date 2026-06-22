import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { DocumentApprovalAction } from "../enums/DocumentApprovalAction.js";
import { DocumentApprovalStatus } from "../enums/DocumentApprovalStatus.js";
import { OrganizationDocumentPatientApproval } from "./OrganizationDocumentPatientApproval.js";

describe("OrganizationDocumentPatientApproval", () => {
  it("creates a pending approval with null rejected reason", () => {
    const approval = OrganizationDocumentPatientApproval.create({
      documentId: "doc-1",
      patientId: "patient-1",
    });

    expect(approval.id).toEqual(expect.any(String));
    expect(approval.status).toBe(DocumentApprovalStatus.Pending);
    expect(approval.rejectedReason).toBeNull();
  });

  it("rejects empty identifiers", () => {
    expect(() =>
      OrganizationDocumentPatientApproval.create({ documentId: " ", patientId: "patient-1" }),
    ).toThrow(DomainValidationError);
    expect(() =>
      OrganizationDocumentPatientApproval.create({ documentId: "doc-1", patientId: " " }),
    ).toThrow(DomainValidationError);
  });

  it("enforces status and rejected reason invariants on creation", () => {
    expect(() =>
      OrganizationDocumentPatientApproval.create({
        documentId: "doc-1",
        patientId: "patient-1",
        status: DocumentApprovalStatus.Rejected,
      }),
    ).toThrow(DomainValidationError);

    expect(() =>
      OrganizationDocumentPatientApproval.create({
        documentId: "doc-1",
        patientId: "patient-1",
        status: DocumentApprovalStatus.Approved,
        rejectedReason: "Ilegivel",
      }),
    ).toThrow(DomainValidationError);
  });

  it("approves and clears rejected reason", () => {
    const approval = OrganizationDocumentPatientApproval.create({
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
      documentId: "doc-1",
      patientId: "patient-1",
      status: DocumentApprovalStatus.Rejected,
      rejectedReason: "Documento ilegivel.",
    });

    expect(approval.resetToPending()).toBe(DocumentApprovalAction.ResetDocumentToPending);
    expect(approval.status).toBe(DocumentApprovalStatus.Pending);
    expect(approval.rejectedReason).toBeNull();
  });
});

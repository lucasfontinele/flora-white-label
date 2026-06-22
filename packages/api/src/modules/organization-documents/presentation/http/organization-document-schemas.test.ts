import { describe, expect, it } from "vitest";
import {
  approvalActionBodySchema,
  createPatientDocumentApprovalBodySchema,
  organizationRequiredDocumentParamsSchema,
  patientDocumentApprovalActionParamsSchema,
  patientDocumentApprovalsParamsSchema,
  rejectApprovalBodySchema,
  requiredDocumentBodySchema,
  requiredDocumentParamsSchema,
} from "./organization-document-schemas.js";

describe("organization document schemas", () => {
  it("accepts required document params and body with trimmed name", () => {
    expect(
      organizationRequiredDocumentParamsSchema.safeParse({ organizationId: "org-1" }).success,
    ).toBe(true);
    expect(
      requiredDocumentParamsSchema.safeParse({ organizationId: "org-1", documentId: "doc-1" })
        .success,
    ).toBe(true);

    const body = requiredDocumentBodySchema.safeParse({ name: " Receita medica " });

    expect(body.success).toBe(true);
    if (body.success) {
      expect(body.data.name).toBe("Receita medica");
    }
  });

  it("accepts optional observations (trimmed, null, or absent)", () => {
    const withObservations = requiredDocumentBodySchema.safeParse({
      name: "Receita",
      observations: " Trazer original. ",
    });
    expect(withObservations.success).toBe(true);
    if (withObservations.success) {
      expect(withObservations.data.observations).toBe("Trazer original.");
    }

    expect(requiredDocumentBodySchema.safeParse({ name: "Receita", observations: null }).success).toBe(
      true,
    );
    expect(requiredDocumentBodySchema.safeParse({ name: "Receita" }).success).toBe(true);
  });

  it("rejects blank required document names and extra fields", () => {
    expect(requiredDocumentBodySchema.safeParse({ name: " " }).success).toBe(false);
    expect(requiredDocumentBodySchema.safeParse({ name: "Receita", fileUrl: "x" }).success).toBe(
      false,
    );
  });

  it("accepts create/list approval params and requires only documentId on create body", () => {
    expect(
      patientDocumentApprovalsParamsSchema.safeParse({
        organizationId: "org-1",
        patientId: "patient-1",
      }).success,
    ).toBe(true);
    expect(
      createPatientDocumentApprovalBodySchema.safeParse({ documentId: "doc-1" }).success,
    ).toBe(true);
    expect(
      createPatientDocumentApprovalBodySchema.safeParse({
        documentId: "doc-1",
        organizationUserId: "user-1",
      }).success,
    ).toBe(false);
  });

  it("validates approve, reset, reject, and log params", () => {
    expect(
      patientDocumentApprovalActionParamsSchema.safeParse({
        organizationId: "org-1",
        patientId: "patient-1",
        approvalId: "approval-1",
      }).success,
    ).toBe(true);
    expect(
      patientDocumentApprovalActionParamsSchema.safeParse({
        organizationId: "org-1",
        patientId: "patient-1",
        approvalId: " ",
      }).success,
    ).toBe(false);
  });

  it("requires organizationUserId for approve/reset and reason for reject", () => {
    expect(approvalActionBodySchema.safeParse({ organizationUserId: "user-1" }).success).toBe(true);
    expect(approvalActionBodySchema.safeParse({ organizationUserId: " " }).success).toBe(false);
    expect(
      rejectApprovalBodySchema.safeParse({
        organizationUserId: "user-1",
        rejectedReason: " Documento ilegivel. ",
      }).success,
    ).toBe(true);
    expect(
      rejectApprovalBodySchema.safeParse({
        organizationUserId: "user-1",
        rejectedReason: " ",
      }).success,
    ).toBe(false);
  });
});

import { apiFetch } from "@/lib/http";
import type { PatientDocumentApproval } from "../types";

export async function approvePatientDocument(
  organizationId: string,
  patientId: string,
  approvalId: string,
  organizationUserId: string,
) {
  return apiFetch<PatientDocumentApproval>(
    `/organizations/${organizationId}/patients/${patientId}/document-approvals/${approvalId}/approve`,
    { method: "POST", body: JSON.stringify({ organizationUserId }), skipMasterHeaders: true },
  );
}

export async function rejectPatientDocument(
  organizationId: string,
  patientId: string,
  approvalId: string,
  organizationUserId: string,
  rejectedReason: string,
) {
  return apiFetch<PatientDocumentApproval>(
    `/organizations/${organizationId}/patients/${patientId}/document-approvals/${approvalId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ organizationUserId, rejectedReason }),
      skipMasterHeaders: true,
    },
  );
}

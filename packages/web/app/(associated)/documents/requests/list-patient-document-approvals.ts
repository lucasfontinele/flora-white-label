import { apiFetch } from "@/lib/http";
import type { ListPatientDocumentApprovalsResponse } from "../types";

export async function listPatientDocumentApprovals(organizationId: string, patientId: string) {
  return apiFetch<ListPatientDocumentApprovalsResponse>(
    `/organizations/${organizationId}/patients/${patientId}/document-approvals`,
    { method: "GET", skipMasterHeaders: true },
  );
}

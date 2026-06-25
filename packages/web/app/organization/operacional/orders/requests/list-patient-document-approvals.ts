import { apiFetch } from "@/lib/http";
import type { ListPatientDocumentApprovalsResponse } from "../types";

// Lists the documents the patient uploaded, so the operator can open them and
// verify the posology before fulfilling the order.
export async function listPatientDocumentApprovals(organizationId: string, patientId: string) {
  return apiFetch<ListPatientDocumentApprovalsResponse>(
    `/organizations/${organizationId}/patients/${patientId}/document-approvals`,
    { method: "GET", skipMasterHeaders: true },
  );
}

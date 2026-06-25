import { apiFetch } from "@/lib/http";
import type { PatientApprovalDetails } from "../types";

export async function getPatientApprovalDetails(organizationId: string, patientId: string) {
  return apiFetch<PatientApprovalDetails>(
    `/organizations/${organizationId}/patients/${patientId}`,
    { method: "GET", skipMasterHeaders: true },
  );
}

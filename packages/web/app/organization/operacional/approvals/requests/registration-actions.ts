import { apiFetch } from "@/lib/http";
import type { Patient } from "../types";

export async function approvePatientRegistration(organizationId: string, patientId: string) {
  return apiFetch<Patient>(
    `/organizations/${organizationId}/patients/${patientId}/approve-registration`,
    { method: "POST", skipMasterHeaders: true },
  );
}

export async function rejectPatientRegistration(
  organizationId: string,
  patientId: string,
  reason: string,
) {
  return apiFetch<Patient>(
    `/organizations/${organizationId}/patients/${patientId}/reject-registration`,
    { method: "POST", body: JSON.stringify({ reason }), skipMasterHeaders: true },
  );
}

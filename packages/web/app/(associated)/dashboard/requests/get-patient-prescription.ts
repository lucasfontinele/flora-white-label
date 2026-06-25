import { apiFetch } from "@/lib/http";
import type { GetPatientPrescriptionResponse } from "../types";

export async function getPatientPrescription(organizationId: string, patientId: string) {
  return apiFetch<GetPatientPrescriptionResponse>(
    `/organizations/${organizationId}/patients/${patientId}/prescription`,
    { method: "GET", skipMasterHeaders: true },
  );
}

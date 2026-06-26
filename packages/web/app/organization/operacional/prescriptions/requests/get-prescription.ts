import { apiFetch } from "@/lib/http";
import type { GetPrescriptionResponse } from "../types";

export async function getPrescription(organizationId: string, patientId: string) {
  return apiFetch<GetPrescriptionResponse>(
    `/organizations/${organizationId}/patients/${patientId}/prescription`,
    { method: "GET", skipMasterHeaders: true },
  );
}

import { apiFetch } from "@/lib/http";
import type { ListPrescribersResponse } from "../types";

export async function getPatientPrescribers(organizationId: string, patientId: string) {
  return apiFetch<ListPrescribersResponse>(
    `/organizations/${organizationId}/patients/${patientId}/prescribers`,
    { method: "GET", skipMasterHeaders: true },
  );
}

import { apiFetch } from "@/lib/http";
import type { ListPatientsResponse, PatientStatus } from "../types";

export async function listPatients(organizationId: string, status?: PatientStatus) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  return apiFetch<ListPatientsResponse>(`/organizations/${organizationId}/patients${query}`, {
    method: "GET",
    skipMasterHeaders: true,
  });
}

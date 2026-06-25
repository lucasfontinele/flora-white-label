import { apiFetch } from "@/lib/http";

export async function deletePrescription(organizationId: string, patientId: string) {
  return apiFetch<void>(`/organizations/${organizationId}/patients/${patientId}/prescription`, {
    method: "DELETE",
    skipMasterHeaders: true,
  });
}

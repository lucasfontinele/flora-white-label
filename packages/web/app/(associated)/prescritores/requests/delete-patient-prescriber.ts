import { apiFetch } from "@/lib/http";

export async function deletePatientPrescriber(
  organizationId: string,
  patientId: string,
  prescriberId: string,
) {
  return apiFetch<void>(
    `/organizations/${organizationId}/patients/${patientId}/prescribers/${prescriberId}`,
    { method: "DELETE", skipMasterHeaders: true },
  );
}

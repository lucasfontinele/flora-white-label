import { apiFetch } from "@/lib/http";
import type { Prescriber, PrescriberWriteBody } from "../types";

export async function updatePatientPrescriber(
  organizationId: string,
  patientId: string,
  prescriberId: string,
  body: PrescriberWriteBody,
) {
  return apiFetch<Prescriber>(
    `/organizations/${organizationId}/patients/${patientId}/prescribers/${prescriberId}`,
    { method: "PUT", body: JSON.stringify(body), skipMasterHeaders: true },
  );
}

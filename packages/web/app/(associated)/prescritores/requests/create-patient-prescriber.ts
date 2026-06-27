import { apiFetch } from "@/lib/http";
import type { Prescriber, PrescriberWriteBody } from "../types";

export async function createPatientPrescriber(
  organizationId: string,
  patientId: string,
  body: PrescriberWriteBody,
) {
  return apiFetch<Prescriber>(
    `/organizations/${organizationId}/patients/${patientId}/prescribers`,
    { method: "POST", body: JSON.stringify(body), skipMasterHeaders: true },
  );
}

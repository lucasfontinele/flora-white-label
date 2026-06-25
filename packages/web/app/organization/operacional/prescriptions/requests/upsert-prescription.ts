import { apiFetch } from "@/lib/http";
import type { Prescription, PrescriptionWriteBody } from "../types";

export async function upsertPrescription(
  organizationId: string,
  patientId: string,
  body: PrescriptionWriteBody,
) {
  return apiFetch<Prescription>(
    `/organizations/${organizationId}/patients/${patientId}/prescription`,
    { method: "PUT", body: JSON.stringify(body), skipMasterHeaders: true },
  );
}

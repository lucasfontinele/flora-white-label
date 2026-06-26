import { apiFetch } from "@/lib/http";
import type { PurchaseLimits } from "../types";

// Limits are per association (white-label portal) + per patient. The receita
// only applies in the organization that transcribed it, so both ids are scoped.
export async function getLimits(organizationId: string, patientId: string) {
  return apiFetch<PurchaseLimits>(
    `/organizations/${organizationId}/patients/${patientId}/purchase-limits`,
    { method: "GET", skipMasterHeaders: true },
  );
}

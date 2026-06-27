import { apiFetch } from "@/lib/http";
import type { CatalogResponse } from "../types";

// The patient catalog is filtered server-side by the patient's posology access
// (released products + categories), scoped to the association (organization).
export async function getCatalog(organizationId: string, patientId: string) {
  return apiFetch<CatalogResponse>(
    `/organizations/${organizationId}/patients/${patientId}/catalog`,
    { method: "GET", skipMasterHeaders: true },
  );
}

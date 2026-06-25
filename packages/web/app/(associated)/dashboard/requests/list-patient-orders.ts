import { apiFetch } from "@/lib/http";
import type { ListPatientOrdersResponse } from "../types";

export async function listPatientOrders(organizationId: string, patientId: string) {
  return apiFetch<ListPatientOrdersResponse>(
    `/organizations/${organizationId}/orders?patientId=${encodeURIComponent(patientId)}`,
    { method: "GET", skipMasterHeaders: true },
  );
}

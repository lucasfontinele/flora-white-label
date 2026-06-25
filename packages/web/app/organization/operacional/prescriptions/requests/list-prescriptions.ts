import { apiFetch } from "@/lib/http";
import type { ListPrescriptionsResponse } from "../types";

export async function listPrescriptions(organizationId: string) {
  return apiFetch<ListPrescriptionsResponse>(`/organizations/${organizationId}/prescriptions`, {
    method: "GET",
    skipMasterHeaders: true,
  });
}

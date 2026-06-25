import { apiFetch } from "@/lib/http";
import type { RolesResponse } from "../types";

export async function listRoles(organizationId: string) {
  return apiFetch<RolesResponse>(`/organizations/${organizationId}/roles`, {
    method: "GET",
    skipMasterHeaders: true,
  });
}

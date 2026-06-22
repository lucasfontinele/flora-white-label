import { apiFetch } from "@/lib/http";
import type { Organization } from "../types";

export async function getOrganization(id: string) {
  return apiFetch<Organization>(`/backoffice/organizations/${id}`, {
    method: "GET",
  });
}

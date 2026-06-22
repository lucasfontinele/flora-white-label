import { apiFetch } from "@/lib/http";
import type { Organization, OrganizationWriteBody } from "../types";

export async function updateOrganization(id: string, body: OrganizationWriteBody) {
  return apiFetch<Organization>(`/backoffice/organizations/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

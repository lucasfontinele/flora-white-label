import { apiFetch } from "@/lib/http";
import type { Organization, OrganizationWriteBody } from "../types";

export async function createOrganization(body: OrganizationWriteBody) {
  return apiFetch<Organization>("/backoffice/organizations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

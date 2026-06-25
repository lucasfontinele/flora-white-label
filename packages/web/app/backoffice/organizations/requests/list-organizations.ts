import { apiFetch } from "@/lib/http";
import type { ListOrganizationsResponse } from "../types";

export async function listOrganizations() {
  return apiFetch<ListOrganizationsResponse>("/backoffice/organizations", {
    method: "GET",
  });
}

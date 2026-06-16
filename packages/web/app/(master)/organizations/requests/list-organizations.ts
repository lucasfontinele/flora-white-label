import type { ListOrganizationsQuery, ListOrganizationsResponse } from "@flora/shared/organizations";
import { apiFetch } from "@/lib/http";

export async function listOrganizations(query: ListOrganizationsQuery = {}) {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.perPage) params.set("perPage", String(query.perPage));

  const search = params.toString();

  return apiFetch<ListOrganizationsResponse>(`/organizations${search ? `?${search}` : ""}`, {
    method: "GET",
  });
}

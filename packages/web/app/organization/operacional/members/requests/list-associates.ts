import { apiFetch } from "@/lib/http";
import type { AssociateFilters, ListAssociatesResponse } from "../types";

export async function listAssociates(organizationId: string, filters: AssociateFilters) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();

  return apiFetch<ListAssociatesResponse>(
    `/organizations/${organizationId}/associates${query ? `?${query}` : ""}`,
    { method: "GET", skipMasterHeaders: true },
  );
}

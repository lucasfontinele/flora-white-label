import { apiFetch } from "@/lib/http";
import type { ListProductsResponse } from "../types";

export async function listProducts(organizationId: string) {
  return apiFetch<ListProductsResponse>(`/organizations/${organizationId}/products`, {
    method: "GET",
    skipMasterHeaders: true,
  });
}

import { apiFetch } from "@/lib/http";
import type { Product, ProductWriteBody } from "../types";

export async function createProduct(organizationId: string, body: ProductWriteBody) {
  return apiFetch<Product>(`/organizations/${organizationId}/products`, {
    method: "POST",
    body: JSON.stringify(body),
    skipMasterHeaders: true,
  });
}

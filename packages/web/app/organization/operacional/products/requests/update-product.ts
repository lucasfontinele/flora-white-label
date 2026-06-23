import { apiFetch } from "@/lib/http";
import type { Product, ProductWriteBody } from "../types";

export async function updateProduct(
  organizationId: string,
  productId: string,
  body: ProductWriteBody,
) {
  return apiFetch<Product>(`/organizations/${organizationId}/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(body),
    skipMasterHeaders: true,
  });
}

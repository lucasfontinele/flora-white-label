import { apiFetch } from "@/lib/http";
import type { Product } from "../types";

// Logical removal: the API soft-deletes the product (isActive = false).
export async function deleteProduct(organizationId: string, productId: string) {
  return apiFetch<Product>(`/organizations/${organizationId}/products/${productId}`, {
    method: "DELETE",
    skipMasterHeaders: true,
  });
}

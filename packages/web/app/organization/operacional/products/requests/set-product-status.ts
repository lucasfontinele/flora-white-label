import { apiFetch } from "@/lib/http";
import type { Product } from "../types";

// Toggles the catalog availability through the dedicated activate/deactivate
// endpoints, so reactivating a soft-deleted product is possible from this screen.
export async function setProductStatus(
  organizationId: string,
  productId: string,
  isActive: boolean,
) {
  const action = isActive ? "activate" : "deactivate";

  return apiFetch<Product>(`/organizations/${organizationId}/products/${productId}/${action}`, {
    method: "PATCH",
    skipMasterHeaders: true,
  });
}

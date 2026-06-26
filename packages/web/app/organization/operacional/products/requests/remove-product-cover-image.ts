import { apiFetch } from "@/lib/http";
import type { Product } from "../types";

export async function removeProductCoverImage(organizationId: string, productId: string) {
  return apiFetch<Product>(
    `/organizations/${organizationId}/products/${productId}/cover-image`,
    {
      method: "DELETE",
      skipMasterHeaders: true,
    },
  );
}

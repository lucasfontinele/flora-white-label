import { apiFetch } from "@/lib/http";
import type { Product } from "../types";

export async function uploadProductCoverImage(
  organizationId: string,
  productId: string,
  file: File,
) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<Product>(
    `/organizations/${organizationId}/products/${productId}/cover-image`,
    {
      method: "PUT",
      body: formData,
      skipMasterHeaders: true,
    },
  );
}

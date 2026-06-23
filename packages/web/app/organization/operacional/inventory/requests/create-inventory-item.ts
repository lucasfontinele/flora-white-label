import { apiFetch } from "@/lib/http";
import type { CreateInventoryItemBody, InventoryItem } from "../types";

export async function createInventoryItem(
  organizationId: string,
  productId: string,
  body: CreateInventoryItemBody,
) {
  return apiFetch<InventoryItem>(
    `/organizations/${organizationId}/products/${productId}/inventory`,
    { method: "POST", body: JSON.stringify(body), skipMasterHeaders: true },
  );
}

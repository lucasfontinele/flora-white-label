import { ApiRequestError, apiFetch } from "@/lib/http";
import type { InventoryItem } from "../types";

// Returns the product's stock position, or null when no position exists yet
// (the API answers 404 in that case).
export async function getInventory(
  organizationId: string,
  productId: string,
): Promise<InventoryItem | null> {
  try {
    return await apiFetch<InventoryItem>(
      `/organizations/${organizationId}/products/${productId}/inventory`,
      { method: "GET", skipMasterHeaders: true },
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

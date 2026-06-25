import { apiFetch } from "@/lib/http";
import type { InventoryItem, StockOperation, StockOperationBody } from "../types";

// All stock operations share the same body shape and differ only by the path
// suffix, so a single request covers add-stock / reserve / release-reservation
// / confirm-stock-out / adjust.
export async function runStockOperation(
  organizationId: string,
  productId: string,
  operation: StockOperation,
  body: StockOperationBody,
) {
  return apiFetch<InventoryItem>(
    `/organizations/${organizationId}/products/${productId}/inventory/${operation}`,
    { method: "POST", body: JSON.stringify(body), skipMasterHeaders: true },
  );
}

import { apiFetch } from "@/lib/http";
import type { ListInventoryMovementsResponse } from "../types";

export async function listInventoryMovements(organizationId: string, productId: string) {
  return apiFetch<ListInventoryMovementsResponse>(
    `/organizations/${organizationId}/products/${productId}/inventory/movements`,
    { method: "GET", skipMasterHeaders: true },
  );
}

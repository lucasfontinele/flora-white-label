import { apiFetch } from "@/lib/http";
import type { GetOrderResponse } from "../types";

export async function getOrder(organizationId: string, orderId: string) {
  return apiFetch<GetOrderResponse>(`/organizations/${organizationId}/orders/${orderId}`, {
    method: "GET",
    skipMasterHeaders: true,
  });
}

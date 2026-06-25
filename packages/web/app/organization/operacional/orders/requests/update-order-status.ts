import { apiFetch } from "@/lib/http";
import type { GetOrderResponse, OrderFulfillmentAction } from "../types";

// Advances the order to the chosen fulfillment outcome through the dedicated
// PATCH endpoints (ready-for-pickup / ship). Returns the updated order.
export async function updateOrderStatus(
  organizationId: string,
  orderId: string,
  action: OrderFulfillmentAction,
) {
  return apiFetch<GetOrderResponse>(
    `/organizations/${organizationId}/orders/${orderId}/${action}`,
    { method: "PATCH", skipMasterHeaders: true },
  );
}

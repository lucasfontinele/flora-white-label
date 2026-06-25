import { apiFetch } from "@/lib/http";
import type { ListOrderPaymentsResponse } from "../types";

export async function listOrderPayments(organizationId: string, orderId: string) {
  return apiFetch<ListOrderPaymentsResponse>(
    `/organizations/${organizationId}/orders/${orderId}/payments`,
    { method: "GET", skipMasterHeaders: true },
  );
}

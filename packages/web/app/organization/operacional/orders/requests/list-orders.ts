import { apiFetch } from "@/lib/http";
import type { ListOrdersResponse, OrderStatus } from "../types";

export async function listOrders(organizationId: string, statuses?: OrderStatus[]) {
  const query =
    statuses && statuses.length > 0
      ? `?status=${encodeURIComponent(statuses.join(","))}`
      : "";

  return apiFetch<ListOrdersResponse>(`/organizations/${organizationId}/orders${query}`, {
    method: "GET",
    skipMasterHeaders: true,
  });
}

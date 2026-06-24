"use client";

import { useQuery } from "@tanstack/react-query";
import { listOrders } from "../requests/list-orders";
import type { OrderStatus } from "../types";

export const ordersQueryKey = (organizationId: string, statuses: OrderStatus[]) =>
  ["organization", "orders", organizationId, statuses] as const;

export function useOrders(organizationId: string, statuses: OrderStatus[]) {
  return useQuery({
    queryKey: ordersQueryKey(organizationId, statuses),
    queryFn: () => listOrders(organizationId, statuses),
    enabled: organizationId.length > 0,
  });
}

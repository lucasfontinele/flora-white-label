"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrders } from "../requests/get-orders";

export function useOrdersQuery(patientId?: string) {
  return useQuery({
    queryKey: ["associated", "orders", patientId],
    queryFn: () => getOrders(patientId),
  });
}

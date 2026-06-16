"use client";

import { useQuery } from "@tanstack/react-query";
import { getOperatorOrders } from "../requests/get-operator-orders";

export function useOperatorOrdersQuery() {
  return useQuery({
    queryKey: ["organization", "orders"],
    queryFn: getOperatorOrders,
  });
}

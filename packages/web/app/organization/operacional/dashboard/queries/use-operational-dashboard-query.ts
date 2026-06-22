"use client";

import { useQuery } from "@tanstack/react-query";
import { getOperationalDashboard } from "../requests/get-operational-dashboard";

export function useOperationalDashboardQuery() {
  return useQuery({
    queryKey: ["organization", "dashboard"],
    queryFn: getOperationalDashboard,
  });
}

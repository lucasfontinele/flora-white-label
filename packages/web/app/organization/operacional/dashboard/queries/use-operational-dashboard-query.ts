"use client";

import { useQuery } from "@tanstack/react-query";
import { getOperationalDashboard } from "../requests/get-operational-dashboard";

export function useOperationalDashboardQuery(organizationId: string, employeeId: string) {
  return useQuery({
    queryKey: ["organization", "dashboard", organizationId, employeeId],
    queryFn: () => getOperationalDashboard(organizationId, employeeId),
    enabled: organizationId.length > 0 && employeeId.length > 0,
  });
}

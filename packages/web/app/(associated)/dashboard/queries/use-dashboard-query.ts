"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../requests/get-dashboard";

export function useDashboardQuery(patientId?: string) {
  return useQuery({
    queryKey: ["associated", "dashboard", patientId],
    queryFn: () => getDashboard(patientId),
  });
}

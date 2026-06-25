"use client";

import { useQuery } from "@tanstack/react-query";
import { getLimits } from "../requests/get-limits";

export function useLimitsQuery(organizationId: string, patientId?: string) {
  return useQuery({
    queryKey: ["associated", "limits", organizationId, patientId],
    queryFn: () => getLimits(organizationId, patientId),
  });
}

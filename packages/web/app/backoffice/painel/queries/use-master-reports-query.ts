"use client";

import { useQuery } from "@tanstack/react-query";
import { getMasterReports } from "../requests/get-master-reports";

export function useMasterReportsQuery(userId: string, organizationIds: string[]) {
  return useQuery({
    // The selected organizations are part of the key so switching the filter
    // refetches (and caches) per selection.
    queryKey: ["master", "reports", userId, [...organizationIds].sort()],
    queryFn: () => getMasterReports(userId, organizationIds),
    enabled: userId.length > 0,
  });
}

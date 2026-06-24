"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrganizationOverview } from "../requests/get-organization-overview";

export const organizationOverviewQueryKey = (organizationId: string) =>
  ["organization", "overview", organizationId] as const;

/**
 * Sidebar counters (total orders + patients awaiting validation). Cached by
 * React Query; the data rarely changes, so it is kept fresh for a few minutes
 * and refetched in the background when stale.
 */
export function useOrganizationOverview(organizationId: string) {
  return useQuery({
    queryKey: organizationOverviewQueryKey(organizationId),
    queryFn: () => getOrganizationOverview(organizationId),
    enabled: organizationId.length > 0,
    staleTime: 5 * 60_000,
  });
}

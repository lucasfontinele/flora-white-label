"use client";

import type { ListOrganizationsQuery } from "@flora/shared/organizations";
import { useQuery } from "@tanstack/react-query";
import { listOrganizations } from "../requests/list-organizations";

export const organizationsQueryKey = (query: ListOrganizationsQuery = {}) => [
  "master",
  "organizations",
  query.page ?? 1,
  query.perPage ?? 20,
];

export function useOrganizations(query: ListOrganizationsQuery = {}) {
  return useQuery({
    queryKey: organizationsQueryKey(query),
    queryFn: () => listOrganizations(query),
  });
}

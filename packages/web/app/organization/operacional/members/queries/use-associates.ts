"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAssociates } from "../requests/list-associates";
import { setUserAccess } from "../requests/set-user-access";
import type { AssociateFilters } from "../types";

export const associatesQueryKey = (organizationId: string, filters: AssociateFilters) =>
  ["organization", "associates", organizationId, filters] as const;

export function useAssociates(organizationId: string, filters: AssociateFilters) {
  return useQuery({
    queryKey: associatesQueryKey(organizationId, filters),
    queryFn: () => listAssociates(organizationId, filters),
    enabled: organizationId.length > 0,
  });
}

export function useSetUserAccess(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      setUserAccess(organizationId, userId, isActive),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["organization", "associates", organizationId] }),
  });
}

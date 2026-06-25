"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrganization } from "../requests/create-organization";
import { deleteOrganization } from "../requests/delete-organization";
import { getOrganization } from "../requests/get-organization";
import { listOrganizations } from "../requests/list-organizations";
import { updateOrganization } from "../requests/update-organization";
import type { OrganizationWriteBody } from "../types";

export const organizationsQueryKey = ["master", "organizations"] as const;

export const organizationQueryKey = (id: string) => ["master", "organizations", id] as const;

export function useOrganizations() {
  return useQuery({
    queryKey: organizationsQueryKey,
    queryFn: listOrganizations,
  });
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationQueryKey(id),
    queryFn: () => getOrganization(id),
    enabled: id.length > 0,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: OrganizationWriteBody) => createOrganization(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizationsQueryKey }),
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: OrganizationWriteBody }) => updateOrganization(id, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: organizationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: organizationQueryKey(variables.id) });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: organizationsQueryKey }),
  });
}

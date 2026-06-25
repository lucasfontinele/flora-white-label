"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listInvitations } from "../requests/list-invitations";
import { listRoles } from "../requests/list-roles";
import { resendInvitation } from "../requests/resend-invitation";
import { sendInvitation } from "../requests/send-invitation";
import { setRolePermissions } from "../requests/set-role-permissions";
import type { RolePermission, SendInvitationBody } from "../types";

export const rolesQueryKey = (organizationId: string) =>
  ["organization", "roles", organizationId] as const;

export const invitationsQueryKey = (organizationId: string) =>
  ["organization", "employee-invitations", organizationId] as const;

export function useRoles(organizationId: string) {
  return useQuery({
    queryKey: rolesQueryKey(organizationId),
    queryFn: () => listRoles(organizationId),
    enabled: organizationId.length > 0,
  });
}

export function useInvitations(organizationId: string) {
  return useQuery({
    queryKey: invitationsQueryKey(organizationId),
    queryFn: () => listInvitations(organizationId),
    enabled: organizationId.length > 0,
  });
}

export function useSetRolePermissions(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: RolePermission[] }) =>
      setRolePermissions(organizationId, roleId, permissions),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: rolesQueryKey(organizationId) }),
  });
}

export function useSendInvitation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SendInvitationBody) => sendInvitation(organizationId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: invitationsQueryKey(organizationId) }),
  });
}

export function useResendInvitation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => resendInvitation(organizationId, invitationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: invitationsQueryKey(organizationId) }),
  });
}

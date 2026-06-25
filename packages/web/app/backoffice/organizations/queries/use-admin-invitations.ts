"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAdminInvitations } from "../requests/list-admin-invitations";
import { resendAdminInvitation } from "../requests/resend-admin-invitation";
import { sendAdminInvitation } from "../requests/send-admin-invitation";
import type { SendAdminInvitationBody } from "../types";

export const adminInvitationsQueryKey = (organizationId: string) =>
  ["master", "organizations", organizationId, "admin-invitations"] as const;

export function useAdminInvitations(organizationId: string, masterUserId: string) {
  return useQuery({
    queryKey: adminInvitationsQueryKey(organizationId),
    queryFn: () => listAdminInvitations(organizationId, masterUserId),
    enabled: organizationId.length > 0 && masterUserId.length > 0,
  });
}

export function useSendAdminInvitation(organizationId: string, masterUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SendAdminInvitationBody) =>
      sendAdminInvitation(organizationId, masterUserId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminInvitationsQueryKey(organizationId) }),
  });
}

export function useResendAdminInvitation(organizationId: string, masterUserId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      resendAdminInvitation(organizationId, masterUserId, invitationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: adminInvitationsQueryKey(organizationId) }),
  });
}

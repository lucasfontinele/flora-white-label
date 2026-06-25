import { apiFetch } from "@/lib/http";
import type { AdminInvitation, SendAdminInvitationBody } from "../types";

/**
 * The route is master-only, so the requesting Master user id is forwarded
 * explicitly via `x-master-user-id` (instead of the apiFetch placeholder),
 * mirroring the master-reports request.
 */
export async function sendAdminInvitation(
  organizationId: string,
  masterUserId: string,
  body: SendAdminInvitationBody,
) {
  return apiFetch<AdminInvitation>(`/backoffice/organizations/${organizationId}/admin-invitations`, {
    method: "POST",
    headers: { "x-master-user-id": masterUserId },
    body: JSON.stringify(body),
  });
}

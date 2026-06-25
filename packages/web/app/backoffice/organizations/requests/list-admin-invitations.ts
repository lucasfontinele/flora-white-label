import { apiFetch } from "@/lib/http";
import type { AdminInvitationsResponse } from "../types";

/**
 * Master-only route — forwards the requesting Master user id explicitly via
 * `x-master-user-id`, mirroring the master-reports request.
 */
export async function listAdminInvitations(organizationId: string, masterUserId: string) {
  return apiFetch<AdminInvitationsResponse>(
    `/backoffice/organizations/${organizationId}/admin-invitations`,
    {
      headers: { "x-master-user-id": masterUserId },
    },
  );
}

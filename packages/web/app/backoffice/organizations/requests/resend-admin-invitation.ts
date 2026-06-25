import { apiFetch } from "@/lib/http";
import type { AdminInvitation } from "../types";

/**
 * Reuses the org-scoped resend endpoint (no full-access restriction). The
 * requesting Master user id is forwarded via `x-master-user-id` for consistency
 * with the other master backoffice requests.
 */
export async function resendAdminInvitation(
  organizationId: string,
  masterUserId: string,
  invitationId: string,
) {
  return apiFetch<AdminInvitation>(
    `/organizations/${organizationId}/employee-invitations/${invitationId}/resend`,
    {
      method: "POST",
      headers: { "x-master-user-id": masterUserId },
    },
  );
}

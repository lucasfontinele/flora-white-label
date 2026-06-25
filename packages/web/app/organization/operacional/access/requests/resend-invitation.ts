import { apiFetch } from "@/lib/http";
import type { Invitation } from "../types";

export async function resendInvitation(organizationId: string, invitationId: string) {
  return apiFetch<Invitation>(
    `/organizations/${organizationId}/employee-invitations/${invitationId}/resend`,
    {
      method: "POST",
      skipMasterHeaders: true,
    },
  );
}

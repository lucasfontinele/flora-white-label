import { apiFetch } from "@/lib/http";
import type { InvitationsResponse } from "../types";

export async function listInvitations(organizationId: string) {
  return apiFetch<InvitationsResponse>(
    `/organizations/${organizationId}/employee-invitations`,
    {
      method: "GET",
      skipMasterHeaders: true,
    },
  );
}

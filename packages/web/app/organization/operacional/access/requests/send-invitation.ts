import { apiFetch } from "@/lib/http";
import type { Invitation, SendInvitationBody } from "../types";

export async function sendInvitation(organizationId: string, body: SendInvitationBody) {
  return apiFetch<Invitation>(`/organizations/${organizationId}/employee-invitations`, {
    method: "POST",
    skipMasterHeaders: true,
    body: JSON.stringify(body),
  });
}

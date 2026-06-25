import { apiFetch } from "@/lib/http";
import type { AcceptInvitationBody, AcceptInvitationResponse } from "../types";

export async function acceptInvitation(token: string, body: AcceptInvitationBody) {
  return apiFetch<AcceptInvitationResponse>(
    `/employee-invitations/${encodeURIComponent(token)}/accept`,
    {
      method: "POST",
      skipMasterHeaders: true,
      body: JSON.stringify(body),
    },
  );
}

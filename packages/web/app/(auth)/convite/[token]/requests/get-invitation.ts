import { apiFetch } from "@/lib/http";
import type { InvitationToken } from "../types";

export async function getInvitation(token: string) {
  return apiFetch<InvitationToken>(`/employee-invitations/${encodeURIComponent(token)}`, {
    method: "GET",
    skipMasterHeaders: true,
  });
}

import { apiFetch } from "@/lib/http";

export async function setUserAccess(organizationId: string, userId: string, isActive: boolean) {
  return apiFetch<{ userId: string; isActive: boolean }>(
    `/organizations/${organizationId}/associates/${userId}/access`,
    { method: "PATCH", body: JSON.stringify({ isActive }), skipMasterHeaders: true },
  );
}

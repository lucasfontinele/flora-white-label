import { apiFetch } from "@/lib/http";

// GET /organizations/:organizationId/overview
export type OrganizationOverview = {
  ordersCount: number;
  pendingApprovalsCount: number;
};

export async function getOrganizationOverview(organizationId: string) {
  return apiFetch<OrganizationOverview>(`/organizations/${organizationId}/overview`, {
    method: "GET",
    skipMasterHeaders: true,
  });
}

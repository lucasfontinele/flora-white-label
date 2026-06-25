import { apiFetch } from "@/lib/http";
import { getMasterReportsResponseSchema } from "../schemas/master-reports-schema";
import type { MasterReports } from "../types";

/**
 * Loads the consolidated network reports. The route is master-only, so the
 * requesting Master user id is forwarded explicitly via `x-master-user-id`
 * (instead of the apiFetch placeholder). An empty `organizationIds` asks for the
 * whole network; otherwise the report is scoped to the selected organizations.
 */
export async function getMasterReports(
  userId: string,
  organizationIds: string[],
): Promise<MasterReports> {
  const query =
    organizationIds.length > 0
      ? `?organizationIds=${encodeURIComponent(organizationIds.join(","))}`
      : "";

  const response = await apiFetch<unknown>(`/backoffice/reports${query}`, {
    method: "GET",
    headers: { "x-master-user-id": userId },
  });

  return getMasterReportsResponseSchema.parse(response).data;
}

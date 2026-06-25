import { apiFetch } from "@/lib/http";
import { getOperationalDashboardResponseSchema } from "../schemas/dashboard-schema";
import type { OperationalDashboard } from "../types";

export async function getOperationalDashboard(
  organizationId: string,
  employeeId: string,
): Promise<OperationalDashboard> {
  const response = await apiFetch<unknown>(
    `/organizations/${organizationId}/operational-dashboard?employeeId=${encodeURIComponent(employeeId)}`,
    { method: "GET", skipMasterHeaders: true },
  );

  return getOperationalDashboardResponseSchema.parse(response).data;
}

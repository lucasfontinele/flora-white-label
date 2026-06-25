import type { GetOperationalDashboardResponse } from "@flora/shared/operational-dashboard";
import { apiFetch } from "@/lib/http";
import { getOperationalDashboardResponseSchema } from "../schemas/dashboard-schema";
import type { OperationalDashboard } from "../types";

export async function getOperationalDashboard(): Promise<OperationalDashboard> {
  const response = await apiFetch<GetOperationalDashboardResponse>("/operational/dashboard", {
    method: "GET",
  });

  return getOperationalDashboardResponseSchema.parse(response).data;
}

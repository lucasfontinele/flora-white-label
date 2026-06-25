import type { OperationalDashboardDto } from "@flora/shared/operational-dashboard";

export type OperationalDashboardRepository = {
  getSummary(): Promise<OperationalDashboardDto>;
};

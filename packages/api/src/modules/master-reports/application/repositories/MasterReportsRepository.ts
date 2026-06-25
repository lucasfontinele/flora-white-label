/**
 * Read model for the backoffice master "Visão geral da rede" reports screen:
 * headline metrics, the last-6-months organization growth, the plan breakdown,
 * the most recent organizations and a few network-health indicators. The shape
 * mirrors what the master dashboard renders.
 *
 * Every figure honours {@link MasterReportsFilter}: an empty filter spans the
 * whole network, a non-empty one is restricted to the selected organizations.
 */
export type MasterMetricTone = "success" | "error";

export interface MasterMetric {
  delta: string;
  hint: string;
  /** Design-system icon name (validated against the icon set on the web side). */
  icon: string;
  label: string;
  tone?: MasterMetricTone;
  value: string;
}

export interface MasterMonthlyOrganizationsPoint {
  /** Short pt-BR month label, e.g. "Jan". */
  month: string;
  /** Total organizations existing by the end of that month (cumulative). */
  value: number;
}

export interface MasterMonthlyOrganizations {
  /** Always the last 6 months, oldest first. */
  points: MasterMonthlyOrganizationsPoint[];
  /** Semester growth headline, e.g. "+54% no semestre" (empty when not computable). */
  growthLabel: string;
}

export interface MasterPlanDistributionItem {
  name: string;
  organizations: number;
  /** Share of the (filtered) network, 0–100. */
  percentage: number;
}

export interface MasterRecentOrganization {
  /** Pre-formatted pt-BR date, e.g. "12 jun 2026". */
  createdAt: string;
  city: string;
  plan: string;
  state: string;
  tradeName: string;
}

export interface MasterNetworkHealthItem {
  icon: string;
  label: string;
  value: string;
}

export interface MasterReports {
  metrics: MasterMetric[];
  monthlyOrganizations: MasterMonthlyOrganizations;
  networkHealth: MasterNetworkHealthItem[];
  planDistribution: MasterPlanDistributionItem[];
  recentOrganizations: MasterRecentOrganization[];
  referenceLabel: string;
}

export interface MasterReportsFilter {
  /**
   * Organizations to restrict the report to. When empty, the report covers
   * every organization on the platform.
   */
  organizationIds: string[];
}

export interface MasterReportsRepository {
  getReports(filter: MasterReportsFilter): Promise<MasterReports>;
}

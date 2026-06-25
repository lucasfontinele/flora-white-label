import type { z } from "zod";
import type {
  masterMetricSchema,
  masterMonthlyOrganizationsSchema,
  masterNetworkHealthItemSchema,
  masterPlanDistributionItemSchema,
  masterRecentOrganizationSchema,
  masterReportsSchema,
} from "./schemas/master-reports-schema";

export type MasterMetric = z.infer<typeof masterMetricSchema>;
export type MasterMonthlyOrganizations = z.infer<typeof masterMonthlyOrganizationsSchema>;
export type MasterPlanDistributionItem = z.infer<typeof masterPlanDistributionItemSchema>;
export type MasterRecentOrganization = z.infer<typeof masterRecentOrganizationSchema>;
export type MasterNetworkHealthItem = z.infer<typeof masterNetworkHealthItemSchema>;
export type MasterReports = z.infer<typeof masterReportsSchema>;

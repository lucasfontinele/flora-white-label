import type { z } from "zod";
import type {
  operationalDashboardSchema,
  operationalLowStockItemSchema,
  operationalMetricSchema,
  operationalOrdersByStatusSchema,
} from "./schemas/dashboard-schema";

export type OperationalMetric = z.infer<typeof operationalMetricSchema>;
export type OperationalOrdersByStatus = z.infer<typeof operationalOrdersByStatusSchema>;
export type OperationalLowStockItem = z.infer<typeof operationalLowStockItemSchema>;
export type OperationalDashboard = z.infer<typeof operationalDashboardSchema>;

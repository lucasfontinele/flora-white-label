/**
 * Read model for the organization's operational overview screen: headline
 * metrics, the orders-by-status breakdown and low-stock alerts. The shape mirrors
 * what the backoffice "Visão geral" renders.
 */
export type OperationalMetricTone = "success" | "error";

export interface OperationalMetric {
  delta: string;
  hint: string;
  /** Design-system icon name (validated against the icon set on the web side). */
  icon: string;
  label: string;
  tone?: OperationalMetricTone;
  value: string;
}

export type OperationalOrderStatus =
  | "Solicitado"
  | "Em análise"
  | "Aprovado"
  | "Em separação"
  | "Pronto para retirada"
  | "Enviado"
  | "Entregue";

export interface OperationalOrdersByStatus {
  count: number;
  status: OperationalOrderStatus;
}

export type OperationalLowStockTone = "success" | "warning" | "error";

export interface OperationalLowStockItem {
  amount: string;
  name: string;
  tone: OperationalLowStockTone;
}

export interface OperationalDashboardSummary {
  lowStock: OperationalLowStockItem[];
  metrics: OperationalMetric[];
  ordersByStatus: OperationalOrdersByStatus[];
  referenceLabel: string;
}

export interface OperationalDashboardRepository {
  getSummary(organizationId: string): Promise<OperationalDashboardSummary>;
}

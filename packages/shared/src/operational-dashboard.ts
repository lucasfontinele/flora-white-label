export type OperationalMetricTone = "success" | "error";

export type OperationalMetricDto = {
  delta: string;
  hint: string;
  icon: string;
  label: string;
  tone?: OperationalMetricTone;
  value: string;
};

export type OperationalOrderStatus =
  | "Solicitado"
  | "Em análise"
  | "Aprovado"
  | "Em separação"
  | "Pronto para retirada"
  | "Enviado"
  | "Entregue";

export type OperationalOrdersByStatusDto = {
  count: number;
  status: OperationalOrderStatus;
};

export type OperationalLowStockTone = "success" | "warning" | "error";

export type OperationalLowStockItemDto = {
  amount: string;
  name: string;
  tone: OperationalLowStockTone;
};

export type OperationalDashboardDto = {
  lowStock: OperationalLowStockItemDto[];
  metrics: OperationalMetricDto[];
  ordersByStatus: OperationalOrdersByStatusDto[];
  referenceLabel: string;
};

export type GetOperationalDashboardResponse = {
  data: OperationalDashboardDto;
};

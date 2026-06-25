// Shapes for the patient portal home (real data: prescription + patient orders).

export const DASHBOARD_ORDER_STATUSES = [
  "REQUESTED",
  "UNDER_REVIEW",
  "IN_SEPARATION",
  "APPROVED",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type DashboardOrderStatus = (typeof DASHBOARD_ORDER_STATUSES)[number];

export const DASHBOARD_ORDER_STATUS_LABELS: Record<DashboardOrderStatus, string> = {
  REQUESTED: "Solicitado",
  UNDER_REVIEW: "Em análise",
  IN_SEPARATION: "Em separação",
  APPROVED: "Aprovado",
  READY_FOR_PICKUP: "Pronto para retirada",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

// Orders in these statuses are finished — not "in progress".
export const TERMINAL_ORDER_STATUSES: DashboardOrderStatus[] = ["DELIVERED", "CANCELLED"];

export type DashboardOrderDeliveryType = "CORREIOS" | "PICKUP";

export type DashboardOrder = {
  id: string;
  token: string;
  patientId: string;
  status: DashboardOrderStatus;
  deliveryType: DashboardOrderDeliveryType;
  itemsAmount: number;
  createdAt: string;
};

// GET /organizations/:organizationId/orders?patientId=
export type ListPatientOrdersResponse = { data: DashboardOrder[] };

export type DashboardPrescription = {
  id: string;
  patientId: string;
  validUntil: string;
  observations: string | null;
};

// GET /organizations/:organizationId/patients/:patientId/prescription
export type GetPatientPrescriptionResponse = {
  prescription: DashboardPrescription | null;
};

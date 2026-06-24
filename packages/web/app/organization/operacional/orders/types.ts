// Shapes and enums for the /organizations/:organizationId/orders endpoint.
// Mirrors the API Order contract (see specs/012-backend-orders-payments).

import type { BadgeProps } from "@/components/ui/badge";

export const ORDER_STATUSES = [
  "REQUESTED",
  "UNDER_REVIEW",
  "IN_SEPARATION",
  "APPROVED",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Portuguese labels used to render the status in the table.
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  REQUESTED: "Solicitado",
  UNDER_REVIEW: "Em análise",
  IN_SEPARATION: "Em separação",
  APPROVED: "Aprovado",
  READY_FOR_PICKUP: "Pronto para retirada",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeProps["tone"]> = {
  REQUESTED: "neutral",
  UNDER_REVIEW: "warning",
  APPROVED: "primary",
  IN_SEPARATION: "info",
  READY_FOR_PICKUP: "accent",
  SHIPPED: "petrol",
  DELIVERED: "success",
  CANCELLED: "error",
};

export const ORDER_DELIVERY_TYPES = ["CORREIOS", "PICKUP"] as const;

export type OrderDeliveryType = (typeof ORDER_DELIVERY_TYPES)[number];

export const ORDER_DELIVERY_LABELS: Record<OrderDeliveryType, string> = {
  CORREIOS: "Correio",
  PICKUP: "Retirada",
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: string;
  organizationId: string;
  token: string;
  patientId: string;
  patientName: string;
  guardianId: string | null;
  guardianName: string | null;
  status: OrderStatus;
  deliveryType: OrderDeliveryType;
  itemsAmount: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

// GET /organizations/:organizationId/orders
export type ListOrdersResponse = {
  data: Order[];
};

// Maps each screen filter tab to the backend OrderStatus values it covers.
export const ORDER_TABS = ["todos", "analise", "separacao", "entregue"] as const;

export type OrderTab = (typeof ORDER_TABS)[number];

export const ORDER_TAB_LABELS: Record<OrderTab, string> = {
  todos: "Todos",
  analise: "Aguardando análise",
  separacao: "Em separação",
  entregue: "Entregues",
};

export const ORDER_TAB_STATUSES: Record<OrderTab, OrderStatus[]> = {
  todos: [],
  analise: ["REQUESTED", "UNDER_REVIEW"],
  separacao: ["IN_SEPARATION"],
  entregue: ["DELIVERED"],
};

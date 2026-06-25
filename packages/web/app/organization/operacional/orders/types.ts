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
  productName: string;
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

// GET /organizations/:organizationId/orders/:orderId
export type GetOrderResponse = Order;

// Fulfillment outcomes an operator can set from the order detail screen. They
// map to the dedicated PATCH endpoints (.../ready-for-pickup and .../ship).
export type OrderFulfillmentAction = "ready-for-pickup" | "ship";

// ---------------------------------------------------------------------------
// Payments — mirrors the API OrderPayment contract.
// ---------------------------------------------------------------------------

export const PAYMENT_STATUSES = [
  "PENDING",
  "EXPIRED",
  "CANCELLED",
  "PAID",
  "UNDER_DISPUTE",
  "REFUNDED",
  "REDEEMED",
  "APPROVED",
  "FAILED",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  EXPIRED: "Expirado",
  CANCELLED: "Cancelado",
  PAID: "Pago",
  UNDER_DISPUTE: "Em disputa",
  REFUNDED: "Reembolsado",
  REDEEMED: "Resgatado",
  APPROVED: "Aprovado",
  FAILED: "Falhou",
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, BadgeProps["tone"]> = {
  PENDING: "warning",
  EXPIRED: "neutral",
  CANCELLED: "error",
  PAID: "success",
  UNDER_DISPUTE: "warning",
  REFUNDED: "info",
  REDEEMED: "info",
  APPROVED: "success",
  FAILED: "error",
};

// A payment in one of these states confirms the order is financially settled.
export const PAYMENT_SETTLED_STATUSES: PaymentStatus[] = ["PAID", "APPROVED"];

export const PAYMENT_METHODS = ["CREDIT_CARD", "BOLETO", "PIX"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
  PIX: "Pix",
};

export type OrderPayment = {
  id: string;
  orderId: string;
  // Amount actually charged, in cents.
  totalPaid: number;
  // Fractional discount applied (0.01–1) or null when none.
  discount: number | null;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  externalPaymentId: string | null;
  checkoutUrl: string | null;
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// GET /organizations/:organizationId/orders/:orderId/payments
export type ListOrderPaymentsResponse = {
  data: OrderPayment[];
};

// ---------------------------------------------------------------------------
// Patient documents — the operator reads these to verify the posology before
// fulfilling the order. Mirrors the patient document-approvals contract.
// ---------------------------------------------------------------------------

export const DOCUMENT_APPROVAL_STATUSES = ["PENDING", "REJECTED", "APPROVED"] as const;

export type DocumentApprovalStatus = (typeof DOCUMENT_APPROVAL_STATUSES)[number];

export const DOCUMENT_STATUS_LABELS: Record<DocumentApprovalStatus, string> = {
  PENDING: "Em análise",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
};

export const DOCUMENT_STATUS_TONE: Record<DocumentApprovalStatus, BadgeProps["tone"]> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

export type PatientDocumentApproval = {
  id: string;
  organizationId: string;
  documentId: string;
  patientId: string;
  status: DocumentApprovalStatus;
  rejectedReason: string | null;
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  storageKey: string | null;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

// GET /organizations/:organizationId/patients/:patientId/document-approvals
export type ListPatientDocumentApprovalsResponse = {
  data: PatientDocumentApproval[];
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

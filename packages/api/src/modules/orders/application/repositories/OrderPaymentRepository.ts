import type { OrderPayment } from "../../domain/entities/OrderPayment.js";
import type { PaymentMethod } from "../../domain/enums/PaymentMethod.js";
import type { PaymentStatus } from "../../domain/enums/PaymentStatus.js";

export interface OrderPaymentReadModel {
  id: string;
  orderId: string;
  organizationId: string;
  totalPaidInCents: number;
  discount: number | null;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  externalPaymentId: string | null;
  checkoutUrl: string | null;
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderPaymentRepository {
  findByIdInOrderInOrganization(
    organizationId: string,
    orderId: string,
    paymentId: string,
  ): Promise<OrderPayment | null>;
  findDetailsByIdInOrderInOrganization(
    organizationId: string,
    orderId: string,
    paymentId: string,
  ): Promise<OrderPaymentReadModel | null>;
  findAllByOrderInOrganization(
    organizationId: string,
    orderId: string,
  ): Promise<OrderPaymentReadModel[]>;
  existsPaidForOrder(organizationId: string, orderId: string): Promise<boolean>;
  create(payment: OrderPayment): Promise<OrderPaymentReadModel>;
  save(payment: OrderPayment): Promise<OrderPaymentReadModel>;
}

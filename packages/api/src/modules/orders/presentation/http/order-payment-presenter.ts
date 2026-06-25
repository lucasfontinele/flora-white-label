import type { OrderPaymentReadModel } from "../../application/repositories/OrderPaymentRepository.js";
import type { PaymentMethod } from "../../domain/enums/PaymentMethod.js";
import type { PaymentStatus } from "../../domain/enums/PaymentStatus.js";

export interface OrderPaymentResponse {
  id: string;
  orderId: string;
  totalPaid: number;
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
}

/**
 * Maps an {@link OrderPaymentReadModel} to its HTTP shape. It exposes ONLY the
 * non-sensitive gateway references; it never emits an api key, secret, or any
 * other gateway credential (none are stored to begin with).
 */
export class OrderPaymentPresenter {
  static toHttp(payment: OrderPaymentReadModel): OrderPaymentResponse {
    return {
      id: payment.id,
      orderId: payment.orderId,
      totalPaid: payment.totalPaidInCents,
      discount: payment.discount,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      externalPaymentId: payment.externalPaymentId,
      checkoutUrl: payment.checkoutUrl,
      pixQrCode: payment.pixQrCode,
      pixQrCodeBase64: payment.pixQrCodeBase64,
      expiresAt: payment.expiresAt ? payment.expiresAt.toISOString() : null,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  }
}

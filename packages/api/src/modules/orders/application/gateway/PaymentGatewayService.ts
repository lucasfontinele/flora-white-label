import type { PaymentMethod } from "../../domain/enums/PaymentMethod.js";
import type { PaymentStatus } from "../../domain/enums/PaymentStatus.js";

export interface PaymentGatewayCustomer {
  name?: string;
  email?: string;
  taxId?: string;
  cellphone?: string;
}

export interface CreatePaymentGatewayInput {
  orderId: string;
  organizationId: string;
  paymentMethod: PaymentMethod;
  /** Amount to charge, in cents (already net of any discount). */
  amountInCents: number;
  description?: string;
  customer?: PaymentGatewayCustomer;
  metadata?: Record<string, string>;
}

export interface CreatePaymentGatewayOutput {
  externalPaymentId: string;
  checkoutUrl?: string | null;
  pixQrCode?: string | null;
  pixQrCodeBase64?: string | null;
  expiresAt?: Date | null;
  /** Initial status mapped from the gateway (normally PENDING). */
  status: PaymentStatus;
}

export interface PaymentGatewayStatusOutput {
  status: PaymentStatus;
}

/**
 * Application port for an external payment gateway. The concrete vendor
 * (AbacatePay) lives in the infrastructure layer, so use cases never depend on
 * a specific provider or on HTTP. Only NON-SENSITIVE data crosses this port:
 * no api key, secret, or credential is ever exposed here.
 */
export interface PaymentGatewayService {
  createPayment(input: CreatePaymentGatewayInput): Promise<CreatePaymentGatewayOutput>;
  getPaymentStatus(externalPaymentId: string): Promise<PaymentGatewayStatusOutput>;
}

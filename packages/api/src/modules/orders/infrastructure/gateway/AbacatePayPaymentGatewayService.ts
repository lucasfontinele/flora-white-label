import type {
  CreatePaymentGatewayInput,
  CreatePaymentGatewayOutput,
  PaymentGatewayService,
  PaymentGatewayStatusOutput,
} from "../../application/gateway/PaymentGatewayService.js";
import { PaymentMethod } from "../../domain/enums/PaymentMethod.js";
import { PaymentStatus } from "../../domain/enums/PaymentStatus.js";
import { PaymentGatewayError, UnsupportedPaymentMethodError } from "./payment-gateway-errors.js";

interface AbacateEnvelope<T> {
  data: T | null;
  success: boolean;
  error: string | null;
}

interface AbacateTransparentData {
  id: string;
  brCode?: string | null;
  brCodeBase64?: string | null;
  status?: string | null;
  expiresAt?: string | null;
}

interface AbacateCheckoutData {
  id: string;
  url?: string | null;
  status?: string | null;
}

interface AbacateStatusData {
  status?: string | null;
}

export interface AbacatePayPaymentGatewayServiceOptions {
  apiKey: string;
  baseUrl: string;
  timeoutMs?: number;
  /** Injectable for tests; defaults to the global fetch. */
  fetchFn?: typeof fetch;
}

const DEFAULT_TIMEOUT_MS = 8000;

/**
 * AbacatePay implementation of {@link PaymentGatewayService}. It isolates every
 * AbacatePay specific (base URL, Bearer auth, the `{ data, success, error }`
 * envelope, the transparent-PIX and hosted-checkout flows) inside the
 * infrastructure layer. PIX uses Checkout Transparente (amount-based, no
 * redirect); CREDIT_CARD uses the hosted Checkout (redirect URL); BOLETO is not
 * documented by the integration and is rejected. The API key is sent as a
 * Bearer token but never returned or logged. Mirrors the outbound-HTTP shape of
 * `TurnstileCaptchaVerifier`.
 */
export class AbacatePayPaymentGatewayService implements PaymentGatewayService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(options: AbacatePayPaymentGatewayServiceOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async createPayment(input: CreatePaymentGatewayInput): Promise<CreatePaymentGatewayOutput> {
    switch (input.paymentMethod) {
      case PaymentMethod.Pix:
        return this.createPixPayment(input);
      case PaymentMethod.CreditCard:
        return this.createCardPayment(input);
      default:
        throw new UnsupportedPaymentMethodError(
          `Payment method ${input.paymentMethod} is not supported by the payment gateway.`,
        );
    }
  }

  async getPaymentStatus(externalPaymentId: string): Promise<PaymentGatewayStatusOutput> {
    const data = await this.request<AbacateStatusData>(
      "/transparents/check",
      "GET",
      undefined,
      { id: externalPaymentId },
    );

    return { status: AbacatePayPaymentGatewayService.mapStatus(data.status) };
  }

  private async createPixPayment(
    input: CreatePaymentGatewayInput,
  ): Promise<CreatePaymentGatewayOutput> {
    const data = await this.request<AbacateTransparentData>("/transparents/create", "POST", {
      data: {
        amount: input.amountInCents,
        description: input.description,
        customer: input.customer,
        metadata: input.metadata,
      },
    });

    return {
      externalPaymentId: data.id,
      checkoutUrl: null,
      pixQrCode: data.brCode ?? null,
      pixQrCodeBase64: data.brCodeBase64 ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      status: AbacatePayPaymentGatewayService.mapStatus(data.status),
    };
  }

  private async createCardPayment(
    input: CreatePaymentGatewayInput,
  ): Promise<CreatePaymentGatewayOutput> {
    const data = await this.request<AbacateCheckoutData>("/checkouts/create", "POST", {
      externalId: input.orderId,
      methods: ["CARD"],
      metadata: {
        ...input.metadata,
        orderId: input.orderId,
        organizationId: input.organizationId,
      },
    });

    return {
      externalPaymentId: data.id,
      checkoutUrl: data.url ?? null,
      pixQrCode: null,
      pixQrCodeBase64: null,
      expiresAt: null,
      status: AbacatePayPaymentGatewayService.mapStatus(data.status),
    };
  }

  private async request<T>(
    path: string,
    method: "GET" | "POST",
    body?: unknown,
    query?: Record<string, string>,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      for (const [name, value] of Object.entries(query)) {
        url.searchParams.set(name, value);
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(url.toString(), {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new PaymentGatewayError(`Payment gateway responded with status ${response.status}.`);
      }

      const envelope = (await response.json()) as AbacateEnvelope<T>;

      if (!envelope.success || envelope.data === null) {
        throw new PaymentGatewayError(envelope.error ?? "Payment gateway request failed.");
      }

      return envelope.data;
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }

      throw new PaymentGatewayError("Payment gateway request failed.");
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Maps an AbacatePay status/event to the local {@link PaymentStatus}. Unknown
   * values map to `PENDING` so a sync never destructively marks a payment as
   * failed on an unrecognized value.
   */
  static mapStatus(raw: string | null | undefined): PaymentStatus {
    switch ((raw ?? "").trim().toUpperCase()) {
      case "PENDING":
        return PaymentStatus.Pending;
      case "PAID":
      case "COMPLETED":
        return PaymentStatus.Paid;
      case "APPROVED":
        return PaymentStatus.Approved;
      case "EXPIRED":
      case "LOST":
        return PaymentStatus.Expired;
      case "CANCELLED":
      case "CANCELED":
        return PaymentStatus.Cancelled;
      case "REFUNDED":
        return PaymentStatus.Refunded;
      case "DISPUTED":
      case "UNDER_DISPUTE":
        return PaymentStatus.UnderDispute;
      case "REDEEMED":
        return PaymentStatus.Redeemed;
      case "FAILED":
        return PaymentStatus.Failed;
      default:
        return PaymentStatus.Pending;
    }
  }
}

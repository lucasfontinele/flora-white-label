import { describe, expect, it, vi } from "vitest";
import { AbacatePayPaymentGatewayService } from "./AbacatePayPaymentGatewayService.js";
import {
  PaymentGatewayError,
  UnsupportedPaymentMethodError,
} from "./payment-gateway-errors.js";
import { PaymentMethod } from "../../domain/enums/PaymentMethod.js";
import { PaymentStatus } from "../../domain/enums/PaymentStatus.js";

function envelope(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ data, success: data !== null, error: null }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function build(fetchFn: typeof fetch) {
  return new AbacatePayPaymentGatewayService({
    apiKey: "test-key",
    baseUrl: "https://abacate.test/v2",
    fetchFn,
  });
}

describe("AbacatePayPaymentGatewayService", () => {
  it("creates a PIX payment via the transparent endpoint and maps the QR code", async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      envelope({
        id: "pix-id",
        brCode: "br-code",
        brCodeBase64: "br-code-base64",
        status: "PENDING",
        expiresAt: "2026-06-24T12:30:00.000Z",
      }),
    );
    const service = build(fetchFn);

    const result = await service.createPayment({
      orderId: "order-1",
      organizationId: "org-1",
      paymentMethod: PaymentMethod.Pix,
      amountInCents: 18000,
    });

    expect(result.externalPaymentId).toBe("pix-id");
    expect(result.pixQrCode).toBe("br-code");
    expect(result.pixQrCodeBase64).toBe("br-code-base64");
    expect(result.checkoutUrl).toBeNull();
    expect(result.status).toBe(PaymentStatus.Pending);

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://abacate.test/v2/transparents/create");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
    expect(JSON.parse(init.body as string)).toMatchObject({ data: { amount: 18000 } });
  });

  it("creates a CREDIT_CARD payment via the hosted checkout and maps the url", async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(envelope({ id: "checkout-id", url: "https://pay.test/checkout", status: "PENDING" }));
    const service = build(fetchFn);

    const result = await service.createPayment({
      orderId: "order-1",
      organizationId: "org-1",
      paymentMethod: PaymentMethod.CreditCard,
      amountInCents: 20000,
    });

    expect(result.externalPaymentId).toBe("checkout-id");
    expect(result.checkoutUrl).toBe("https://pay.test/checkout");
    expect(result.pixQrCode).toBeNull();

    const [url] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://abacate.test/v2/checkouts/create");
  });

  it("rejects BOLETO without calling the gateway", async () => {
    const fetchFn = vi.fn();
    const service = build(fetchFn);

    await expect(
      service.createPayment({
        orderId: "order-1",
        organizationId: "org-1",
        paymentMethod: PaymentMethod.Boleto,
        amountInCents: 1000,
      }),
    ).rejects.toBeInstanceOf(UnsupportedPaymentMethodError);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("checks the PIX status by id and maps it", async () => {
    const fetchFn = vi.fn().mockResolvedValue(envelope({ status: "PAID" }));
    const service = build(fetchFn);

    const result = await service.getPaymentStatus("pix-id");

    expect(result.status).toBe(PaymentStatus.Paid);
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://abacate.test/v2/transparents/check?id=pix-id");
    expect(init.method).toBe("GET");
  });

  it("throws a PaymentGatewayError on an unsuccessful envelope or non-ok response", async () => {
    const failedEnvelope = build(
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: null, success: false, error: "boom" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    await expect(failedEnvelope.getPaymentStatus("x")).rejects.toBeInstanceOf(PaymentGatewayError);

    const httpError = build(vi.fn().mockResolvedValue(envelope({ status: "PAID" }, 500)));
    await expect(httpError.getPaymentStatus("x")).rejects.toBeInstanceOf(PaymentGatewayError);

    const transportError = build(vi.fn().mockRejectedValue(new Error("network down")));
    await expect(transportError.getPaymentStatus("x")).rejects.toBeInstanceOf(PaymentGatewayError);
  });

  it("maps known and unknown gateway statuses deterministically", () => {
    expect(AbacatePayPaymentGatewayService.mapStatus("PAID")).toBe(PaymentStatus.Paid);
    expect(AbacatePayPaymentGatewayService.mapStatus("completed")).toBe(PaymentStatus.Paid);
    expect(AbacatePayPaymentGatewayService.mapStatus("EXPIRED")).toBe(PaymentStatus.Expired);
    expect(AbacatePayPaymentGatewayService.mapStatus("REFUNDED")).toBe(PaymentStatus.Refunded);
    expect(AbacatePayPaymentGatewayService.mapStatus("disputed")).toBe(PaymentStatus.UnderDispute);
    expect(AbacatePayPaymentGatewayService.mapStatus("???")).toBe(PaymentStatus.Pending);
  });
});

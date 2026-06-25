import { describe, expect, it } from "vitest";
import { OrderPayment } from "./OrderPayment.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { DiscountRate } from "../../../../shared/domain/value-objects/DiscountRate.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { PaymentMethod } from "../enums/PaymentMethod.js";
import { PaymentStatus } from "../enums/PaymentStatus.js";

function buildPayment() {
  return OrderPayment.create({
    orderId: "order-1",
    organizationId: "org-1",
    totalPaid: MoneyInCents.create(21600),
    discount: DiscountRate.create(0.1),
    paymentMethod: PaymentMethod.Pix,
  });
}

describe("OrderPayment", () => {
  it("starts as PENDING with null gateway references", () => {
    const payment = buildPayment();

    expect(payment.status).toBe(PaymentStatus.Pending);
    expect(payment.totalPaidInCents).toBe(21600);
    expect(payment.discountValue).toBe(0.1);
    expect(payment.paymentMethod).toBe(PaymentMethod.Pix);
    expect(payment.externalPaymentId).toBeNull();
    expect(payment.checkoutUrl).toBeNull();
    expect(payment.pixQrCode).toBeNull();
  });

  it("attaches non-sensitive gateway references", () => {
    const payment = buildPayment();
    const expiresAt = new Date("2026-06-24T12:30:00.000Z");

    payment.attachGatewayReference({
      externalPaymentId: "ext-1",
      pixQrCode: "pix-code",
      pixQrCodeBase64: "pix-base64",
      expiresAt,
    });

    expect(payment.externalPaymentId).toBe("ext-1");
    expect(payment.pixQrCode).toBe("pix-code");
    expect(payment.pixQrCodeBase64).toBe("pix-base64");
    expect(payment.expiresAt).toEqual(expiresAt);
    expect(payment.checkoutUrl).toBeNull();
  });

  it("requires an external id to attach a reference", () => {
    const payment = buildPayment();

    expect(() => payment.attachGatewayReference({ externalPaymentId: " " })).toThrow(
      DomainValidationError,
    );
  });

  it("syncs status only after an external reference exists", () => {
    const payment = buildPayment();

    expect(() => payment.syncStatus(PaymentStatus.Paid)).toThrow(DomainValidationError);

    payment.attachGatewayReference({ externalPaymentId: "ext-1" });
    payment.syncStatus(PaymentStatus.Paid);

    expect(payment.status).toBe(PaymentStatus.Paid);
  });

  it("allows creation without a discount", () => {
    const payment = OrderPayment.create({
      orderId: "order-1",
      organizationId: "org-1",
      totalPaid: MoneyInCents.create(10000),
      paymentMethod: PaymentMethod.CreditCard,
    });

    expect(payment.discountValue).toBeNull();
  });
});

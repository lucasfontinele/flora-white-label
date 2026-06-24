import { describe, expect, it } from "vitest";
import { CreateOrderPaymentUseCase } from "./CreateOrderPaymentUseCase.js";
import {
  FakePaymentGatewayService,
  InMemoryOrderPaymentRepository,
  InMemoryOrderRepository,
  immediateUnitOfWork,
} from "./order-use-case-test-utils.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { Order } from "../../domain/entities/Order.js";
import { OrderPayment } from "../../domain/entities/OrderPayment.js";
import { OrderDeliveryType } from "../../domain/enums/OrderDeliveryType.js";
import { PaymentMethod } from "../../domain/enums/PaymentMethod.js";
import { PaymentStatus } from "../../domain/enums/PaymentStatus.js";

function setup() {
  const orderRepository = new InMemoryOrderRepository();
  const orderPaymentRepository = new InMemoryOrderPaymentRepository();
  const paymentGateway = new FakePaymentGatewayService();

  const order = Order.create({
    organizationId: "org-1",
    patientId: "patient-1",
    deliveryType: OrderDeliveryType.Correios,
    // gross = 10000 * 2 = 20000 cents
    items: [{ productId: "product-1", unitPriceInCents: 10000, quantity: 2 }],
  });
  orderRepository.seed(order);

  const useCase = new CreateOrderPaymentUseCase({
    orderRepository,
    orderPaymentRepository,
    paymentGateway,
    unitOfWork: immediateUnitOfWork,
  });

  return { useCase, order, orderRepository, orderPaymentRepository, paymentGateway };
}

describe("CreateOrderPaymentUseCase", () => {
  it("creates a PENDING payment, applies the discount and attaches gateway references", async () => {
    const { useCase, order, paymentGateway } = setup();

    const payment = await useCase.execute({
      organizationId: "org-1",
      orderId: order.id,
      paymentMethod: PaymentMethod.Pix,
      discount: 0.1,
    });

    expect(payment.status).toBe(PaymentStatus.Pending);
    // round(20000 * 0.9) = 18000
    expect(payment.totalPaidInCents).toBe(18000);
    expect(payment.discount).toBe(0.1);
    expect(payment.externalPaymentId).toBe("gateway-ext-1");
    expect(payment.pixQrCode).toBe("00020126-pix-copy-paste");
    expect(paymentGateway.createCalls[0]?.amountInCents).toBe(18000);
  });

  it("charges the full gross amount when no discount is provided", async () => {
    const { useCase, order } = setup();

    const payment = await useCase.execute({
      organizationId: "org-1",
      orderId: order.id,
      paymentMethod: PaymentMethod.Pix,
    });

    expect(payment.totalPaidInCents).toBe(20000);
    expect(payment.discount).toBeNull();
  });

  it("supports the boundary discounts 0.01 and 1", async () => {
    const first = setup();
    const minimal = await first.useCase.execute({
      organizationId: "org-1",
      orderId: first.order.id,
      paymentMethod: PaymentMethod.Pix,
      discount: 0.01,
    });
    expect(minimal.totalPaidInCents).toBe(Math.round(20000 * 0.99));

    const second = setup();
    const full = await second.useCase.execute({
      organizationId: "org-1",
      orderId: second.order.id,
      paymentMethod: PaymentMethod.Pix,
      discount: 1,
    });
    expect(full.totalPaidInCents).toBe(0);
  });

  it("rejects an unknown order", async () => {
    const { useCase } = setup();

    await expect(
      useCase.execute({
        organizationId: "org-1",
        orderId: "missing",
        paymentMethod: PaymentMethod.Pix,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a payment on a cancelled order", async () => {
    const { useCase, order } = setup();
    order.cancel();

    await expect(
      useCase.execute({
        organizationId: "org-1",
        orderId: order.id,
        paymentMethod: PaymentMethod.Pix,
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });

  it("rejects a new payment when the order already has a settled payment", async () => {
    const { useCase, order, orderPaymentRepository } = setup();
    const paid = OrderPayment.create({
      orderId: order.id,
      organizationId: "org-1",
      totalPaid: MoneyInCents.create(20000),
      paymentMethod: PaymentMethod.Pix,
    });
    paid.attachGatewayReference({ externalPaymentId: "ext-paid" });
    paid.syncStatus(PaymentStatus.Paid);
    orderPaymentRepository.seed(paid);

    await expect(
      useCase.execute({
        organizationId: "org-1",
        orderId: order.id,
        paymentMethod: PaymentMethod.Pix,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("does not persist an orphan payment when the gateway fails", async () => {
    const { useCase, order, orderPaymentRepository, paymentGateway } = setup();
    paymentGateway.createError = new Error("gateway down");

    await expect(
      useCase.execute({
        organizationId: "org-1",
        orderId: order.id,
        paymentMethod: PaymentMethod.Pix,
      }),
    ).rejects.toThrow("gateway down");

    expect(orderPaymentRepository.createCalls).toBe(0);
    expect(orderPaymentRepository.payments.size).toBe(0);
  });

  it("never exposes a gateway secret in the response", async () => {
    const { useCase, order } = setup();

    const payment = await useCase.execute({
      organizationId: "org-1",
      orderId: order.id,
      paymentMethod: PaymentMethod.Pix,
    });

    const serialized = JSON.stringify(payment).toLowerCase();
    expect(serialized).not.toContain("secret");
    expect(serialized).not.toContain("apikey");
    expect(serialized).not.toContain("authorization");
    expect(serialized).not.toContain("bearer");
  });
});

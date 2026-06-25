import { describe, expect, it } from "vitest";
import { GetOrderPaymentByIdUseCase } from "./GetOrderPaymentByIdUseCase.js";
import { ListOrderPaymentsUseCase } from "./ListOrderPaymentsUseCase.js";
import { SyncOrderPaymentStatusUseCase } from "./SyncOrderPaymentStatusUseCase.js";
import {
  FakePaymentGatewayService,
  InMemoryOrderPaymentRepository,
  InMemoryOrderRepository,
  immediateUnitOfWork,
} from "./order-use-case-test-utils.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { Order } from "../../domain/entities/Order.js";
import { OrderPayment } from "../../domain/entities/OrderPayment.js";
import { OrderDeliveryType } from "../../domain/enums/OrderDeliveryType.js";
import { PaymentMethod } from "../../domain/enums/PaymentMethod.js";
import { PaymentStatus } from "../../domain/enums/PaymentStatus.js";

function seedOrderWithPayment(options?: { withReference?: boolean }) {
  const orderRepository = new InMemoryOrderRepository();
  const orderPaymentRepository = new InMemoryOrderPaymentRepository();

  const order = Order.create({
    organizationId: "org-1",
    patientId: "patient-1",
    deliveryType: OrderDeliveryType.Pickup,
    items: [{ productId: "product-1", unitPriceInCents: 1000, quantity: 1 }],
  });
  orderRepository.seed(order);

  const payment = OrderPayment.create({
    orderId: order.id,
    organizationId: "org-1",
    totalPaid: MoneyInCents.create(1000),
    paymentMethod: PaymentMethod.Pix,
  });
  if (options?.withReference ?? true) {
    payment.attachGatewayReference({ externalPaymentId: "ext-1" });
  }
  orderPaymentRepository.seed(payment);

  return { orderRepository, orderPaymentRepository, order, payment };
}

describe("ListOrderPaymentsUseCase", () => {
  it("lists the payments of a scoped order", async () => {
    const { orderRepository, orderPaymentRepository, order } = seedOrderWithPayment();
    const useCase = new ListOrderPaymentsUseCase({ orderRepository, orderPaymentRepository });

    const result = await useCase.execute({ organizationId: "org-1", orderId: order.id });

    expect(result.data).toHaveLength(1);
  });

  it("rejects an unknown order", async () => {
    const { orderRepository, orderPaymentRepository } = seedOrderWithPayment();
    const useCase = new ListOrderPaymentsUseCase({ orderRepository, orderPaymentRepository });

    await expect(
      useCase.execute({ organizationId: "org-1", orderId: "missing" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("GetOrderPaymentByIdUseCase", () => {
  it("returns a scoped payment", async () => {
    const { orderPaymentRepository, order, payment } = seedOrderWithPayment();
    const useCase = new GetOrderPaymentByIdUseCase(orderPaymentRepository);

    const result = await useCase.execute({
      organizationId: "org-1",
      orderId: order.id,
      paymentId: payment.id,
    });

    expect(result.id).toBe(payment.id);
  });

  it("rejects a payment from another organization", async () => {
    const { orderPaymentRepository, order, payment } = seedOrderWithPayment();
    const useCase = new GetOrderPaymentByIdUseCase(orderPaymentRepository);

    await expect(
      useCase.execute({ organizationId: "org-2", orderId: order.id, paymentId: payment.id }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("SyncOrderPaymentStatusUseCase", () => {
  it("syncs the status from the gateway", async () => {
    const { orderPaymentRepository, order, payment } = seedOrderWithPayment();
    const gateway = new FakePaymentGatewayService();
    gateway.statusResult = { status: PaymentStatus.Paid };

    const useCase = new SyncOrderPaymentStatusUseCase({
      orderPaymentRepository,
      paymentGateway: gateway,
      unitOfWork: immediateUnitOfWork,
    });

    const result = await useCase.execute({
      organizationId: "org-1",
      orderId: order.id,
      paymentId: payment.id,
    });

    expect(result.status).toBe(PaymentStatus.Paid);
    expect(gateway.statusCalls).toEqual(["ext-1"]);
  });

  it("rejects syncing a payment without an external reference", async () => {
    const { orderPaymentRepository, order, payment } = seedOrderWithPayment({
      withReference: false,
    });
    const gateway = new FakePaymentGatewayService();

    const useCase = new SyncOrderPaymentStatusUseCase({
      orderPaymentRepository,
      paymentGateway: gateway,
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({ organizationId: "org-1", orderId: order.id, paymentId: payment.id }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    expect(gateway.statusCalls).toHaveLength(0);
  });

  it("rejects an unknown payment", async () => {
    const { orderPaymentRepository, order } = seedOrderWithPayment();
    const gateway = new FakePaymentGatewayService();

    const useCase = new SyncOrderPaymentStatusUseCase({
      orderPaymentRepository,
      paymentGateway: gateway,
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({ organizationId: "org-1", orderId: order.id, paymentId: "missing" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

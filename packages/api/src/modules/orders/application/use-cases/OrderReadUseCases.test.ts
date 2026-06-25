import { describe, expect, it } from "vitest";
import { CancelOrderUseCase } from "./CancelOrderUseCase.js";
import { GetOrderByIdUseCase } from "./GetOrderByIdUseCase.js";
import { ListOrdersUseCase } from "./ListOrdersUseCase.js";
import { UpdateOrderFulfillmentStatusUseCase } from "./UpdateOrderFulfillmentStatusUseCase.js";
import { InMemoryOrderRepository, immediateUnitOfWork } from "./order-use-case-test-utils.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { Order } from "../../domain/entities/Order.js";
import { OrderDeliveryType } from "../../domain/enums/OrderDeliveryType.js";
import { OrderStatus } from "../../domain/enums/OrderStatus.js";

function seedOrder(repository: InMemoryOrderRepository, organizationId: string): Order {
  const order = Order.create({
    organizationId,
    patientId: "patient-1",
    deliveryType: OrderDeliveryType.Pickup,
    items: [{ productId: "product-1", unitPriceInCents: 1000, quantity: 1 }],
  });
  repository.seed(order);

  return order;
}

describe("ListOrdersUseCase", () => {
  it("returns only the organization's orders", async () => {
    const repository = new InMemoryOrderRepository();
    seedOrder(repository, "org-1");
    seedOrder(repository, "org-2");

    const useCase = new ListOrdersUseCase(repository);
    const result = await useCase.execute({ organizationId: "org-1" });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.organizationId).toBe("org-1");
  });

  it("filters by the provided statuses", async () => {
    const repository = new InMemoryOrderRepository();
    const requested = seedOrder(repository, "org-1");
    const cancelled = seedOrder(repository, "org-1");
    cancelled.cancel();

    const useCase = new ListOrdersUseCase(repository);

    const onlyCancelled = await useCase.execute({
      organizationId: "org-1",
      statuses: [OrderStatus.Cancelled],
    });
    expect(onlyCancelled.data).toHaveLength(1);
    expect(onlyCancelled.data[0]?.id).toBe(cancelled.id);

    const all = await useCase.execute({ organizationId: "org-1", statuses: [] });
    expect(all.data).toHaveLength(2);
    expect(all.data.map((order) => order.id)).toEqual(
      expect.arrayContaining([requested.id, cancelled.id]),
    );
  });
});

describe("GetOrderByIdUseCase", () => {
  it("returns a scoped order", async () => {
    const repository = new InMemoryOrderRepository();
    const order = seedOrder(repository, "org-1");

    const useCase = new GetOrderByIdUseCase(repository);
    const result = await useCase.execute({ organizationId: "org-1", orderId: order.id });

    expect(result.id).toBe(order.id);
  });

  it("rejects an order from another organization", async () => {
    const repository = new InMemoryOrderRepository();
    const order = seedOrder(repository, "org-1");

    const useCase = new GetOrderByIdUseCase(repository);

    await expect(
      useCase.execute({ organizationId: "org-2", orderId: order.id }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("CancelOrderUseCase", () => {
  it("cancels an order", async () => {
    const repository = new InMemoryOrderRepository();
    const order = seedOrder(repository, "org-1");

    const useCase = new CancelOrderUseCase({ orderRepository: repository, unitOfWork: immediateUnitOfWork });
    const result = await useCase.execute({ organizationId: "org-1", orderId: order.id });

    expect(result.status).toBe(OrderStatus.Cancelled);
    expect(repository.saveCalls).toBe(1);
  });

  it("rejects cancelling an already cancelled order", async () => {
    const repository = new InMemoryOrderRepository();
    const order = seedOrder(repository, "org-1");
    order.cancel();

    const useCase = new CancelOrderUseCase({ orderRepository: repository, unitOfWork: immediateUnitOfWork });

    await expect(
      useCase.execute({ organizationId: "org-1", orderId: order.id }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });

  it("rejects an unknown order", async () => {
    const repository = new InMemoryOrderRepository();
    const useCase = new CancelOrderUseCase({ orderRepository: repository, unitOfWork: immediateUnitOfWork });

    await expect(
      useCase.execute({ organizationId: "org-1", orderId: "missing" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("UpdateOrderFulfillmentStatusUseCase", () => {
  it("marks an order ready for pickup", async () => {
    const repository = new InMemoryOrderRepository();
    const order = seedOrder(repository, "org-1");

    const useCase = new UpdateOrderFulfillmentStatusUseCase({
      orderRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });
    const result = await useCase.execute({
      organizationId: "org-1",
      orderId: order.id,
      target: "READY_FOR_PICKUP",
    });

    expect(result.status).toBe(OrderStatus.ReadyForPickup);
    expect(repository.saveCalls).toBe(1);
  });

  it("marks an order as shipped (awaiting correios)", async () => {
    const repository = new InMemoryOrderRepository();
    const order = seedOrder(repository, "org-1");

    const useCase = new UpdateOrderFulfillmentStatusUseCase({
      orderRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });
    const result = await useCase.execute({
      organizationId: "org-1",
      orderId: order.id,
      target: "SHIPPED",
    });

    expect(result.status).toBe(OrderStatus.Shipped);
  });

  it("rejects transitioning a cancelled order", async () => {
    const repository = new InMemoryOrderRepository();
    const order = seedOrder(repository, "org-1");
    order.cancel();

    const useCase = new UpdateOrderFulfillmentStatusUseCase({
      orderRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({ organizationId: "org-1", orderId: order.id, target: "READY_FOR_PICKUP" }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });

  it("rejects an order from another organization", async () => {
    const repository = new InMemoryOrderRepository();
    const order = seedOrder(repository, "org-1");

    const useCase = new UpdateOrderFulfillmentStatusUseCase({
      orderRepository: repository,
      unitOfWork: immediateUnitOfWork,
    });

    await expect(
      useCase.execute({ organizationId: "org-2", orderId: order.id, target: "SHIPPED" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

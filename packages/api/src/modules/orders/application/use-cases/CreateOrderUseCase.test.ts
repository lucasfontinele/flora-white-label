import { describe, expect, it } from "vitest";
import { CreateOrderUseCase } from "./CreateOrderUseCase.js";
import {
  FakePatientRepository,
  FakeProductRepository,
  InMemoryOrderRepository,
  fakeProduct,
  immediateUnitOfWork,
} from "./order-use-case-test-utils.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { OrderDeliveryType } from "../../domain/enums/OrderDeliveryType.js";
import { OrderStatus } from "../../domain/enums/OrderStatus.js";

function buildUseCase(options?: {
  products?: ReturnType<typeof fakeProduct>[];
  patients?: { id: string; guardianId?: string | null }[];
  orderRepository?: InMemoryOrderRepository;
}) {
  const orderRepository = options?.orderRepository ?? new InMemoryOrderRepository();
  const productRepository = new FakeProductRepository(
    options?.products ?? [fakeProduct({ id: "product-1", priceInCents: 12000 })],
  );
  const patientRepository = new FakePatientRepository(
    options?.patients ?? [{ id: "patient-1", guardianId: null }],
  );

  const useCase = new CreateOrderUseCase({
    orderRepository,
    productRepository,
    patientRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { useCase, orderRepository, productRepository, patientRepository };
}

describe("CreateOrderUseCase", () => {
  it("creates an order, freezes the unit price and computes itemsAmount", async () => {
    const { useCase } = buildUseCase();

    const order = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      deliveryType: OrderDeliveryType.Correios,
      items: [{ productId: "product-1", quantity: 2 }],
    });

    expect(order.status).toBe(OrderStatus.Requested);
    expect(order.token).toMatch(/^ORD-/);
    expect(order.itemsAmount).toBe(2);
    expect(order.items).toHaveLength(1);
    expect(order.items[0]?.unitPriceInCents).toBe(12000);
  });

  it("rejects an unknown patient", async () => {
    const { useCase } = buildUseCase({ patients: [] });

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "missing",
        deliveryType: OrderDeliveryType.Correios,
        items: [{ productId: "product-1", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects a guardian that does not match the patient's responsible", async () => {
    const { useCase } = buildUseCase({ patients: [{ id: "patient-1", guardianId: "guardian-1" }] });

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        guardianId: "guardian-other",
        deliveryType: OrderDeliveryType.Correios,
        items: [{ productId: "product-1", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });

  it("accepts the matching guardian", async () => {
    const { useCase } = buildUseCase({ patients: [{ id: "patient-1", guardianId: "guardian-1" }] });

    const order = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      guardianId: "guardian-1",
      deliveryType: OrderDeliveryType.Correios,
      items: [{ productId: "product-1", quantity: 1 }],
    });

    expect(order.guardianId).toBe("guardian-1");
  });

  it("rejects an unknown product", async () => {
    const { useCase } = buildUseCase({ products: [] });

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        deliveryType: OrderDeliveryType.Correios,
        items: [{ productId: "missing", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects an inactive product", async () => {
    const { useCase } = buildUseCase({
      products: [fakeProduct({ id: "product-1", priceInCents: 12000, isActive: false })],
    });

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        deliveryType: OrderDeliveryType.Correios,
        items: [{ productId: "product-1", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });

  it("fails to create when a unique token cannot be generated", async () => {
    const orderRepository = new InMemoryOrderRepository();
    // Force existsByToken to always report a collision.
    orderRepository.existsByToken = async () => true;
    const { useCase } = buildUseCase({ orderRepository });

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        deliveryType: OrderDeliveryType.Correios,
        items: [{ productId: "product-1", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

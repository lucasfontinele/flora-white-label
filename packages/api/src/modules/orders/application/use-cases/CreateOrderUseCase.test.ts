import { describe, expect, it } from "vitest";
import { CreateOrderUseCase } from "./CreateOrderUseCase.js";
import {
  FakePatientRepository,
  FakePrescriptionRepository,
  FakeProductRepository,
  InMemoryOrderRepository,
  fakeProduct,
  immediateUnitOfWork,
} from "./order-use-case-test-utils.js";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { PatientPrescriptionReadModel } from "../../../prescriptions/application/repositories/PatientPrescriptionRepository.js";
import { PrescriptionItemScope } from "../../../prescriptions/domain/enums/PrescriptionItemScope.js";
import { PrescriptionPeriod } from "../../../prescriptions/domain/enums/PrescriptionPeriod.js";
import { ProductCategory } from "../../../products/domain/enums/ProductCategory.js";
import { ProductUnit } from "../../../products/domain/enums/ProductUnit.js";
import { OrderDeliveryType } from "../../domain/enums/OrderDeliveryType.js";
import { OrderStatus } from "../../domain/enums/OrderStatus.js";

interface FakePosologyItem {
  scope?: PrescriptionItemScope;
  productId?: string;
  category?: ProductCategory;
  allowedQuantity: number;
  period?: PrescriptionPeriod;
}

function buildPrescription(options?: {
  expired?: boolean;
  items?: FakePosologyItem[];
}): PatientPrescriptionReadModel {
  const validUntil = options?.expired
    ? new Date("2020-01-01T00:00:00.000Z")
    : new Date("2999-01-01T00:00:00.000Z");
  const items = options?.items ?? [{ productId: "product-1", allowedQuantity: 100 }];

  return {
    id: "presc-1",
    organizationId: "org-1",
    patientId: "patient-1",
    patientName: "Patient patient-1",
    issuedAt: new Date("2026-06-01T00:00:00.000Z"),
    validUntil,
    observations: null,
    items: items.map((item, index) => {
      const scope = item.scope ?? PrescriptionItemScope.Product;
      const isProduct = scope === PrescriptionItemScope.Product;
      const productId = item.productId ?? "product-1";
      return {
        id: `item-${index}`,
        scope,
        productId: isProduct ? productId : null,
        productName: isProduct ? `Product ${productId}` : null,
        productUnit: isProduct ? ProductUnit.Unit : null,
        category: isProduct ? null : (item.category ?? null),
        allowedQuantity: item.allowedQuantity,
        period: item.period ?? PrescriptionPeriod.Monthly,
        notes: null,
      };
    }),
    createdAt: new Date("2026-06-01T00:00:00.000Z"),
    updatedAt: new Date("2026-06-01T00:00:00.000Z"),
  };
}

function buildUseCase(options?: {
  products?: ReturnType<typeof fakeProduct>[];
  patients?: { id: string; guardianId?: string | null }[];
  orderRepository?: InMemoryOrderRepository;
  prescription?: PatientPrescriptionReadModel | null;
}) {
  const orderRepository = options?.orderRepository ?? new InMemoryOrderRepository();
  const productRepository = new FakeProductRepository(
    options?.products ?? [fakeProduct({ id: "product-1", priceInCents: 12000 })],
  );
  const patientRepository = new FakePatientRepository(
    options?.patients ?? [{ id: "patient-1", guardianId: null }],
  );
  const prescriptionRepository = new FakePrescriptionRepository();
  const prescription =
    options?.prescription === undefined ? buildPrescription() : options.prescription;
  if (prescription) {
    prescriptionRepository.seedDetails(prescription);
  }

  const useCase = new CreateOrderUseCase({
    orderRepository,
    productRepository,
    patientRepository,
    prescriptionRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { useCase, orderRepository, productRepository, patientRepository, prescriptionRepository };
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

  it("rejects an order when the patient has no prescription", async () => {
    const { useCase } = buildUseCase({ prescription: null });

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        deliveryType: OrderDeliveryType.Correios,
        items: [{ productId: "product-1", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects an order when the prescription is expired", async () => {
    const { useCase } = buildUseCase({ prescription: buildPrescription({ expired: true }) });

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        deliveryType: OrderDeliveryType.Correios,
        items: [{ productId: "product-1", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects a product that is not in the posology", async () => {
    const { useCase } = buildUseCase({
      products: [fakeProduct({ id: "product-2", priceInCents: 5000 })],
      prescription: buildPrescription({ items: [{ productId: "product-1", allowedQuantity: 10 }] }),
    });

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        deliveryType: OrderDeliveryType.Correios,
        items: [{ productId: "product-2", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects when the requested quantity exceeds the period allowance", async () => {
    const { useCase } = buildUseCase({
      prescription: buildPrescription({ items: [{ productId: "product-1", allowedQuantity: 3 }] }),
    });

    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        deliveryType: OrderDeliveryType.Correios,
        items: [{ productId: "product-1", quantity: 4 }],
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("allows a product covered by a category-scoped posology line", async () => {
    const { useCase } = buildUseCase({
      products: [
        fakeProduct({ id: "oleo-1", priceInCents: 8000, category: ProductCategory.Oil }),
      ],
      prescription: buildPrescription({
        items: [
          { scope: PrescriptionItemScope.Category, category: ProductCategory.Oil, allowedQuantity: 10 },
        ],
      }),
    });

    const order = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      deliveryType: OrderDeliveryType.Correios,
      items: [{ productId: "oleo-1", quantity: 2 }],
    });

    expect(order.itemsAmount).toBe(2);
  });

  it("rejects when the category allowance is exceeded across the category", async () => {
    const orderRepository = new InMemoryOrderRepository();
    orderRepository.consumptionByCategory.set(ProductCategory.Oil, 8);
    const { useCase } = buildUseCase({
      orderRepository,
      products: [
        fakeProduct({ id: "oleo-1", priceInCents: 8000, category: ProductCategory.Oil }),
        fakeProduct({ id: "oleo-2", priceInCents: 9000, category: ProductCategory.Oil }),
      ],
      prescription: buildPrescription({
        items: [
          { scope: PrescriptionItemScope.Category, category: ProductCategory.Oil, allowedQuantity: 10 },
        ],
      }),
    });

    // 8 already used + (2 + 1) requested across the category = 11 > 10 allowed.
    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        deliveryType: OrderDeliveryType.Correios,
        items: [
          { productId: "oleo-1", quantity: 2 },
          { productId: "oleo-2", quantity: 1 },
        ],
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("counts previous consumption against the allowance", async () => {
    const orderRepository = new InMemoryOrderRepository();
    orderRepository.consumptionByProduct.set("product-1", 3);
    const { useCase } = buildUseCase({
      orderRepository,
      prescription: buildPrescription({ items: [{ productId: "product-1", allowedQuantity: 4 }] }),
    });

    // 3 already used + 2 requested = 5 > 4 allowed.
    await expect(
      useCase.execute({
        organizationId: "org-1",
        patientId: "patient-1",
        deliveryType: OrderDeliveryType.Correios,
        items: [{ productId: "product-1", quantity: 2 }],
      }),
    ).rejects.toBeInstanceOf(ConflictError);

    // 3 already used + 1 requested = 4 == 4 allowed → allowed.
    const order = await useCase.execute({
      organizationId: "org-1",
      patientId: "patient-1",
      deliveryType: OrderDeliveryType.Correios,
      items: [{ productId: "product-1", quantity: 1 }],
    });
    expect(order.itemsAmount).toBe(1);
  });
});

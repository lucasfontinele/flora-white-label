import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { InventoryItem } from "../../domain/entities/InventoryItem.js";
import { InventoryMovementType } from "../../domain/enums/InventoryMovementType.js";
import { CreateInventoryItemUseCase } from "./CreateInventoryItemUseCase.js";
import {
  FakeProductRepository,
  immediateUnitOfWork,
  InMemoryInventoryItemRepository,
  InMemoryInventoryMovementRepository,
} from "./inventory-use-case-test-utils.js";

function makeSut(productKeys = ["organization-1:product-1"]) {
  const productRepository = new FakeProductRepository(productKeys);
  const inventoryItemRepository = new InMemoryInventoryItemRepository();
  const inventoryMovementRepository = new InMemoryInventoryMovementRepository();
  const useCase = new CreateInventoryItemUseCase({
    productRepository,
    inventoryItemRepository,
    inventoryMovementRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { inventoryItemRepository, inventoryMovementRepository, useCase };
}

const baseInput = {
  organizationId: "organization-1",
  productId: "product-1",
  minimumQuantity: 10,
  createdByUserId: "user-1",
};

describe("CreateInventoryItemUseCase", () => {
  it("creates a position with reserved zero and an opening IN movement when available > 0", async () => {
    const { inventoryItemRepository, inventoryMovementRepository, useCase } = makeSut();

    const output = await useCase.execute({ ...baseInput, availableQuantity: 100, reason: "Opening" });

    expect(output.availableQuantity).toBe(100);
    expect(output.reservedQuantity).toBe(0);
    expect(output.minimumQuantity).toBe(10);
    expect(output.belowMinimum).toBe(false);
    expect(inventoryItemRepository.items.size).toBe(1);
    expect(inventoryMovementRepository.movements).toHaveLength(1);
    expect(inventoryMovementRepository.movements[0]?.type).toBe(InventoryMovementType.In);
    expect(inventoryMovementRepository.movements[0]?.createdByUserId).toBe("user-1");
  });

  it("creates a position without a movement when available is zero", async () => {
    const { inventoryMovementRepository, useCase } = makeSut();

    const output = await useCase.execute({ ...baseInput });

    expect(output.availableQuantity).toBe(0);
    expect(inventoryMovementRepository.movements).toHaveLength(0);
  });

  it("throws when the product does not exist in the organization", async () => {
    const { inventoryItemRepository, useCase } = makeSut([]);

    await expect(useCase.execute({ ...baseInput, availableQuantity: 5 })).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(inventoryItemRepository.items.size).toBe(0);
  });

  it("throws when a position already exists for the product", async () => {
    const { inventoryItemRepository, useCase } = makeSut();
    inventoryItemRepository.seed(
      InventoryItem.create({ organizationId: "organization-1", productId: "product-1" }),
    );

    await expect(useCase.execute(baseInput)).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects invalid initial quantities before persistence", async () => {
    const { inventoryItemRepository, useCase } = makeSut();

    await expect(
      useCase.execute({ ...baseInput, availableQuantity: -1 }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    expect(inventoryItemRepository.items.size).toBe(0);
  });
});

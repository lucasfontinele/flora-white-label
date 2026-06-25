import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { InventoryItem } from "../../domain/entities/InventoryItem.js";
import { InventoryMovementType } from "../../domain/enums/InventoryMovementType.js";
import { AddStockUseCase } from "./AddStockUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryInventoryItemRepository,
  InMemoryInventoryMovementRepository,
} from "./inventory-use-case-test-utils.js";

function makeSut() {
  const inventoryItemRepository = new InMemoryInventoryItemRepository();
  const inventoryMovementRepository = new InMemoryInventoryMovementRepository();
  const useCase = new AddStockUseCase({
    inventoryItemRepository,
    inventoryMovementRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { inventoryItemRepository, inventoryMovementRepository, useCase };
}

const target = { organizationId: "organization-1", productId: "product-1" };

describe("AddStockUseCase", () => {
  it("increases available quantity and appends an IN movement", async () => {
    const { inventoryItemRepository, inventoryMovementRepository, useCase } = makeSut();
    inventoryItemRepository.seed(InventoryItem.create({ ...target, availableQuantity: 10 }));

    const output = await useCase.execute({ ...target, quantity: 5, createdByUserId: "user-1" });

    expect(output.availableQuantity).toBe(15);
    expect(inventoryMovementRepository.movements).toHaveLength(1);
    expect(inventoryMovementRepository.movements[0]?.type).toBe(InventoryMovementType.In);
  });

  it("throws when the position does not exist", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ ...target, quantity: 5, createdByUserId: "user-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects invalid quantity without appending a movement", async () => {
    const { inventoryItemRepository, inventoryMovementRepository, useCase } = makeSut();
    inventoryItemRepository.seed(InventoryItem.create({ ...target, availableQuantity: 10 }));

    await expect(
      useCase.execute({ ...target, quantity: 0, createdByUserId: "user-1" }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    expect(inventoryMovementRepository.movements).toHaveLength(0);
  });
});

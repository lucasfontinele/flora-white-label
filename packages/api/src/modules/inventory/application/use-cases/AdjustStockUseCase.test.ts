import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { InventoryItem } from "../../domain/entities/InventoryItem.js";
import { InventoryMovementType } from "../../domain/enums/InventoryMovementType.js";
import { AdjustStockUseCase } from "./AdjustStockUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryInventoryItemRepository,
  InMemoryInventoryMovementRepository,
} from "./inventory-use-case-test-utils.js";

function makeSut() {
  const inventoryItemRepository = new InMemoryInventoryItemRepository();
  const inventoryMovementRepository = new InMemoryInventoryMovementRepository();
  const useCase = new AdjustStockUseCase({
    inventoryItemRepository,
    inventoryMovementRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { inventoryItemRepository, inventoryMovementRepository, useCase };
}

const target = { organizationId: "organization-1", productId: "product-1" };

describe("AdjustStockUseCase", () => {
  it("sets available to an absolute value, preserves reserved, and appends an ADJUSTMENT", async () => {
    const { inventoryItemRepository, inventoryMovementRepository, useCase } = makeSut();
    inventoryItemRepository.seed(
      InventoryItem.restore(
        { ...target, availableQuantity: 10, reservedQuantity: 4, minimumQuantity: 0 },
        "inventory-1",
      ),
    );

    const output = await useCase.execute({ ...target, quantity: 25, createdByUserId: "user-1" });

    expect(output.availableQuantity).toBe(25);
    expect(output.reservedQuantity).toBe(4);
    expect(inventoryMovementRepository.movements[0]?.type).toBe(InventoryMovementType.Adjustment);
    expect(inventoryMovementRepository.movements[0]?.quantity).toBe(25);
  });

  it("rejects a negative adjustment without persisting a movement", async () => {
    const { inventoryItemRepository, inventoryMovementRepository, useCase } = makeSut();
    inventoryItemRepository.seed(InventoryItem.create({ ...target, availableQuantity: 10 }));

    await expect(
      useCase.execute({ ...target, quantity: -1, createdByUserId: "user-1" }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    expect(inventoryMovementRepository.movements).toHaveLength(0);
  });

  it("throws when the position does not exist", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ ...target, quantity: 5, createdByUserId: "user-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

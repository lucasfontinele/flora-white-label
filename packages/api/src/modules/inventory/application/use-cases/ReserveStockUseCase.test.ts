import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { InventoryItem } from "../../domain/entities/InventoryItem.js";
import { InventoryMovementType } from "../../domain/enums/InventoryMovementType.js";
import { ReserveStockUseCase } from "./ReserveStockUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryInventoryItemRepository,
  InMemoryInventoryMovementRepository,
} from "./inventory-use-case-test-utils.js";

function makeSut() {
  const inventoryItemRepository = new InMemoryInventoryItemRepository();
  const inventoryMovementRepository = new InMemoryInventoryMovementRepository();
  const useCase = new ReserveStockUseCase({
    inventoryItemRepository,
    inventoryMovementRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { inventoryItemRepository, inventoryMovementRepository, useCase };
}

const target = { organizationId: "organization-1", productId: "product-1" };

describe("ReserveStockUseCase", () => {
  it("moves quantity from available to reserved and appends a RESERVE movement", async () => {
    const { inventoryItemRepository, inventoryMovementRepository, useCase } = makeSut();
    inventoryItemRepository.seed(InventoryItem.create({ ...target, availableQuantity: 10 }));

    const output = await useCase.execute({ ...target, quantity: 4, createdByUserId: "user-1" });

    expect(output.availableQuantity).toBe(6);
    expect(output.reservedQuantity).toBe(4);
    expect(inventoryMovementRepository.movements[0]?.type).toBe(InventoryMovementType.Reserve);
  });

  it("rejects reserving more than available without persisting", async () => {
    const { inventoryItemRepository, inventoryMovementRepository, useCase } = makeSut();
    inventoryItemRepository.seed(InventoryItem.create({ ...target, availableQuantity: 3 }));

    await expect(
      useCase.execute({ ...target, quantity: 4, createdByUserId: "user-1" }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    expect(inventoryItemRepository.items.get("organization-1:product-1")?.reservedQuantity).toBe(0);
    expect(inventoryMovementRepository.movements).toHaveLength(0);
  });

  it("throws when the position does not exist", async () => {
    const { useCase } = makeSut();

    await expect(
      useCase.execute({ ...target, quantity: 1, createdByUserId: "user-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

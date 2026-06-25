import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { InventoryItem } from "../../domain/entities/InventoryItem.js";
import { InventoryMovementType } from "../../domain/enums/InventoryMovementType.js";
import { ConfirmStockOutUseCase } from "./ConfirmStockOutUseCase.js";
import {
  immediateUnitOfWork,
  InMemoryInventoryItemRepository,
  InMemoryInventoryMovementRepository,
} from "./inventory-use-case-test-utils.js";

function makeSut() {
  const inventoryItemRepository = new InMemoryInventoryItemRepository();
  const inventoryMovementRepository = new InMemoryInventoryMovementRepository();
  const useCase = new ConfirmStockOutUseCase({
    inventoryItemRepository,
    inventoryMovementRepository,
    unitOfWork: immediateUnitOfWork,
  });

  return { inventoryItemRepository, inventoryMovementRepository, useCase };
}

const target = { organizationId: "organization-1", productId: "product-1" };

function seedReserved(repository: InMemoryInventoryItemRepository) {
  repository.seed(
    InventoryItem.restore(
      { ...target, availableQuantity: 6, reservedQuantity: 4, minimumQuantity: 0 },
      "inventory-1",
    ),
  );
}

describe("ConfirmStockOutUseCase", () => {
  it("decreases reserved, leaves available unchanged, and appends an OUT movement", async () => {
    const { inventoryItemRepository, inventoryMovementRepository, useCase } = makeSut();
    seedReserved(inventoryItemRepository);

    const output = await useCase.execute({ ...target, quantity: 3, createdByUserId: "user-1" });

    expect(output.reservedQuantity).toBe(1);
    expect(output.availableQuantity).toBe(6);
    expect(inventoryMovementRepository.movements[0]?.type).toBe(InventoryMovementType.Out);
  });

  it("rejects confirming more than reserved without persisting", async () => {
    const { inventoryItemRepository, inventoryMovementRepository, useCase } = makeSut();
    seedReserved(inventoryItemRepository);

    await expect(
      useCase.execute({ ...target, quantity: 5, createdByUserId: "user-1" }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    expect(inventoryMovementRepository.movements).toHaveLength(0);
  });
});

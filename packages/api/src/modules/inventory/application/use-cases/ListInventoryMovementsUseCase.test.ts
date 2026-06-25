import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { Quantity } from "../../../../shared/domain/value-objects/Quantity.js";
import { InventoryItem } from "../../domain/entities/InventoryItem.js";
import { InventoryMovement } from "../../domain/entities/InventoryMovement.js";
import { InventoryMovementType } from "../../domain/enums/InventoryMovementType.js";
import { ListInventoryMovementsUseCase } from "./ListInventoryMovementsUseCase.js";
import {
  InMemoryInventoryItemRepository,
  InMemoryInventoryMovementRepository,
} from "./inventory-use-case-test-utils.js";

function makeSut() {
  const inventoryItemRepository = new InMemoryInventoryItemRepository();
  const inventoryMovementRepository = new InMemoryInventoryMovementRepository();
  const useCase = new ListInventoryMovementsUseCase({
    inventoryItemRepository,
    inventoryMovementRepository,
  });

  return { inventoryItemRepository, inventoryMovementRepository, useCase };
}

const target = { organizationId: "organization-1", productId: "product-1" };

function movement(type: InventoryMovementType) {
  return InventoryMovement.create({
    organizationId: "organization-1",
    inventoryItemId: "inventory-1",
    productId: "product-1",
    type,
    quantity: Quantity.create(5),
    reason: null,
    createdByUserId: "user-1",
  });
}

describe("ListInventoryMovementsUseCase", () => {
  it("returns movements for the requested organization/product, most recent first", async () => {
    const { inventoryItemRepository, inventoryMovementRepository, useCase } = makeSut();
    inventoryItemRepository.seed(InventoryItem.create({ ...target }));
    await inventoryMovementRepository.append([
      movement(InventoryMovementType.In),
      movement(InventoryMovementType.Reserve),
    ]);

    const output = await useCase.execute(target);

    expect(output.data).toHaveLength(2);
    expect(output.data[0]?.type).toBe(InventoryMovementType.Reserve);
    expect(output.data[1]?.type).toBe(InventoryMovementType.In);
  });

  it("throws when the position does not exist", async () => {
    const { useCase } = makeSut();

    await expect(useCase.execute(target)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("does not leak movements from another organization", async () => {
    const { inventoryItemRepository, inventoryMovementRepository, useCase } = makeSut();
    inventoryItemRepository.seed(InventoryItem.create({ ...target }));
    await inventoryMovementRepository.append([movement(InventoryMovementType.In)]);

    const output = await useCase.execute({ organizationId: "organization-1", productId: "product-1" });
    expect(output.data).toHaveLength(1);

    inventoryItemRepository.seed(
      InventoryItem.create({ organizationId: "organization-2", productId: "product-1" }),
    );
    const otherOrg = await useCase.execute({
      organizationId: "organization-2",
      productId: "product-1",
    });
    expect(otherOrg.data).toHaveLength(0);
  });
});

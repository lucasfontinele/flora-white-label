import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { InventoryItem } from "../../domain/entities/InventoryItem.js";
import { GetInventoryItemUseCase } from "./GetInventoryItemUseCase.js";
import { InMemoryInventoryItemRepository } from "./inventory-use-case-test-utils.js";

function makeSut() {
  const inventoryItemRepository = new InMemoryInventoryItemRepository();
  const useCase = new GetInventoryItemUseCase(inventoryItemRepository);

  return { inventoryItemRepository, useCase };
}

describe("GetInventoryItemUseCase", () => {
  it("returns the scoped position", async () => {
    const { inventoryItemRepository, useCase } = makeSut();
    inventoryItemRepository.seed(
      InventoryItem.create({
        organizationId: "organization-1",
        productId: "product-1",
        availableQuantity: 30,
        minimumQuantity: 5,
      }),
    );

    const output = await useCase.execute({
      organizationId: "organization-1",
      productId: "product-1",
    });

    expect(output.availableQuantity).toBe(30);
    expect(output.productId).toBe("product-1");
  });

  it("throws when the position does not exist for the organization/product", async () => {
    const { inventoryItemRepository, useCase } = makeSut();
    inventoryItemRepository.seed(
      InventoryItem.create({ organizationId: "organization-1", productId: "product-1" }),
    );

    await expect(
      useCase.execute({ organizationId: "organization-2", productId: "product-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type {
  InventoryItemReadModel,
  InventoryItemRepository,
} from "../repositories/InventoryItemRepository.js";

export interface GetInventoryItemInput {
  organizationId: string;
  productId: string;
}

export class GetInventoryItemUseCase {
  constructor(private readonly inventoryItemRepository: InventoryItemRepository) {}

  async execute(input: GetInventoryItemInput): Promise<InventoryItemReadModel> {
    const item = await this.inventoryItemRepository.findDetailsByProductInOrganization(
      input.organizationId,
      input.productId,
    );

    if (!item) {
      throw new NotFoundError("Inventory item not found.");
    }

    return item;
  }
}

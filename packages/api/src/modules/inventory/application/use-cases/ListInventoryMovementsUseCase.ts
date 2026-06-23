import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { InventoryItemRepository } from "../repositories/InventoryItemRepository.js";
import type {
  InventoryMovementReadModel,
  InventoryMovementRepository,
} from "../repositories/InventoryMovementRepository.js";

export interface ListInventoryMovementsInput {
  organizationId: string;
  productId: string;
}

export interface ListInventoryMovementsOutput {
  data: InventoryMovementReadModel[];
}

export interface ListInventoryMovementsDependencies {
  inventoryItemRepository: InventoryItemRepository;
  inventoryMovementRepository: InventoryMovementRepository;
}

export class ListInventoryMovementsUseCase {
  constructor(private readonly deps: ListInventoryMovementsDependencies) {}

  async execute(input: ListInventoryMovementsInput): Promise<ListInventoryMovementsOutput> {
    const exists = await this.deps.inventoryItemRepository.existsForProduct(
      input.organizationId,
      input.productId,
    );

    if (!exists) {
      throw new NotFoundError("Inventory item not found.");
    }

    const data = await this.deps.inventoryMovementRepository.listByProductInOrganization(
      input.organizationId,
      input.productId,
    );

    return { data };
  }
}

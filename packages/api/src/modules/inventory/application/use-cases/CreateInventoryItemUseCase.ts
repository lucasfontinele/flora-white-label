import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { Quantity } from "../../../../shared/domain/value-objects/Quantity.js";
import type { ProductRepository } from "../../../products/application/repositories/ProductRepository.js";
import { InventoryItem } from "../../domain/entities/InventoryItem.js";
import { InventoryMovement } from "../../domain/entities/InventoryMovement.js";
import type {
  InventoryItemReadModel,
  InventoryItemRepository,
} from "../repositories/InventoryItemRepository.js";
import type { InventoryMovementRepository } from "../repositories/InventoryMovementRepository.js";

export interface CreateInventoryItemInput {
  organizationId: string;
  productId: string;
  availableQuantity?: number;
  minimumQuantity?: number;
  reason?: string | null;
  createdByUserId: string;
}

export interface CreateInventoryItemDependencies {
  productRepository: ProductRepository;
  inventoryItemRepository: InventoryItemRepository;
  inventoryMovementRepository: InventoryMovementRepository;
  unitOfWork: UnitOfWork;
}

export class CreateInventoryItemUseCase {
  constructor(private readonly deps: CreateInventoryItemDependencies) {}

  async execute(input: CreateInventoryItemInput): Promise<InventoryItemReadModel> {
    const product = await this.deps.productRepository.findByIdInOrganization(
      input.organizationId,
      input.productId,
    );
    if (!product) {
      throw new NotFoundError("Product not found.");
    }

    const alreadyExists = await this.deps.inventoryItemRepository.existsForProduct(
      input.organizationId,
      input.productId,
    );
    if (alreadyExists) {
      throw new ConflictError("Inventory item already exists for this product.");
    }

    const item = InventoryItem.create({
      organizationId: input.organizationId,
      productId: input.productId,
      availableQuantity: input.availableQuantity,
      minimumQuantity: input.minimumQuantity,
      reason: input.reason,
    });

    return this.deps.unitOfWork.execute(async () => {
      const readModel = await this.deps.inventoryItemRepository.create(item);

      const movements = item.pullMovements().map((draft) =>
        InventoryMovement.create({
          organizationId: item.organizationId,
          inventoryItemId: item.id,
          productId: item.productId,
          type: draft.type,
          quantity: Quantity.create(draft.quantity),
          reason: draft.reason,
          createdByUserId: input.createdByUserId,
        }),
      );

      await this.deps.inventoryMovementRepository.append(movements);

      return readModel;
    });
  }
}

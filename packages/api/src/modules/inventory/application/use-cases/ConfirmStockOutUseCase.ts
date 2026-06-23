import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { Quantity } from "../../../../shared/domain/value-objects/Quantity.js";
import { InventoryMovement } from "../../domain/entities/InventoryMovement.js";
import type {
  InventoryItemReadModel,
  InventoryItemRepository,
} from "../repositories/InventoryItemRepository.js";
import type { InventoryMovementRepository } from "../repositories/InventoryMovementRepository.js";

export interface ConfirmStockOutInput {
  organizationId: string;
  productId: string;
  quantity: number;
  reason?: string | null;
  createdByUserId: string;
}

export interface ConfirmStockOutDependencies {
  inventoryItemRepository: InventoryItemRepository;
  inventoryMovementRepository: InventoryMovementRepository;
  unitOfWork: UnitOfWork;
}

export class ConfirmStockOutUseCase {
  constructor(private readonly deps: ConfirmStockOutDependencies) {}

  async execute(input: ConfirmStockOutInput): Promise<InventoryItemReadModel> {
    return this.deps.unitOfWork.execute(async () => {
      const item = await this.deps.inventoryItemRepository.findByProductInOrganization(
        input.organizationId,
        input.productId,
      );

      if (!item) {
        throw new NotFoundError("Inventory item not found.");
      }

      item.confirmStockOut(input.quantity, input.reason);

      const readModel = await this.deps.inventoryItemRepository.save(item);

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

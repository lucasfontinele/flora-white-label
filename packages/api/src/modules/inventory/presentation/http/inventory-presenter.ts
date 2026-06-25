import type { InventoryItemReadModel } from "../../application/repositories/InventoryItemRepository.js";
import type { InventoryMovementReadModel } from "../../application/repositories/InventoryMovementRepository.js";
import type { InventoryMovementType } from "../../domain/enums/InventoryMovementType.js";

export interface InventoryItemResponse {
  id: string;
  organizationId: string;
  productId: string;
  availableQuantity: number;
  reservedQuantity: number;
  minimumQuantity: number;
  belowMinimum: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovementResponse {
  id: string;
  organizationId: string;
  inventoryItemId: string;
  productId: string;
  type: InventoryMovementType;
  quantity: number;
  reason: string | null;
  createdByUserId: string;
  createdAt: string;
}

export class InventoryPresenter {
  static toItemHttp(item: InventoryItemReadModel): InventoryItemResponse {
    return {
      id: item.id,
      organizationId: item.organizationId,
      productId: item.productId,
      availableQuantity: item.availableQuantity,
      reservedQuantity: item.reservedQuantity,
      minimumQuantity: item.minimumQuantity,
      belowMinimum: item.belowMinimum,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  static toMovementHttp(movement: InventoryMovementReadModel): InventoryMovementResponse {
    return {
      id: movement.id,
      organizationId: movement.organizationId,
      inventoryItemId: movement.inventoryItemId,
      productId: movement.productId,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      createdByUserId: movement.createdByUserId,
      createdAt: movement.createdAt.toISOString(),
    };
  }
}

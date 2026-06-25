import type { InventoryMovement } from "../../domain/entities/InventoryMovement.js";
import type { InventoryMovementType } from "../../domain/enums/InventoryMovementType.js";

export interface InventoryMovementReadModel {
  id: string;
  organizationId: string;
  inventoryItemId: string;
  productId: string;
  type: InventoryMovementType;
  quantity: number;
  reason: string | null;
  createdByUserId: string;
  createdAt: Date;
}

export interface InventoryMovementRepository {
  append(movements: InventoryMovement[]): Promise<void>;
  listByProductInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<InventoryMovementReadModel[]>;
}

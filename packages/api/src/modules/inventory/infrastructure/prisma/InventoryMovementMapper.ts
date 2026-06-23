import type { Prisma, InventoryMovement as PrismaInventoryMovement } from "@prisma/client";
import type { InventoryMovementReadModel } from "../../application/repositories/InventoryMovementRepository.js";
import type { InventoryMovement } from "../../domain/entities/InventoryMovement.js";
import { InventoryMovementType } from "../../domain/enums/InventoryMovementType.js";

export class InventoryMovementMapper {
  static toReadModel(record: PrismaInventoryMovement): InventoryMovementReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      inventoryItemId: record.inventoryItemId,
      productId: record.productId,
      type: record.type as InventoryMovementType,
      quantity: record.quantity,
      reason: record.reason,
      createdByUserId: record.createdByUserId,
      createdAt: record.createdAt,
    };
  }

  static toPersistence(movement: InventoryMovement): Prisma.InventoryMovementUncheckedCreateInput {
    return {
      id: movement.id,
      organizationId: movement.organizationId,
      inventoryItemId: movement.inventoryItemId,
      productId: movement.productId,
      type: movement.type,
      quantity: movement.quantity,
      reason: movement.reason,
      createdByUserId: movement.createdByUserId,
    };
  }
}

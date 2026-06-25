import type { Prisma, InventoryItem as PrismaInventoryItem } from "@prisma/client";
import type { InventoryItemReadModel } from "../../application/repositories/InventoryItemRepository.js";
import { InventoryItem } from "../../domain/entities/InventoryItem.js";

export class InventoryItemMapper {
  static toDomain(record: PrismaInventoryItem): InventoryItem {
    return InventoryItem.restore(
      {
        organizationId: record.organizationId,
        productId: record.productId,
        availableQuantity: record.availableQuantity,
        reservedQuantity: record.reservedQuantity,
        minimumQuantity: record.minimumQuantity,
      },
      record.id,
    );
  }

  static toReadModel(record: PrismaInventoryItem): InventoryItemReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      productId: record.productId,
      availableQuantity: record.availableQuantity,
      reservedQuantity: record.reservedQuantity,
      minimumQuantity: record.minimumQuantity,
      belowMinimum: record.availableQuantity < record.minimumQuantity,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toPersistence(item: InventoryItem): Prisma.InventoryItemUncheckedCreateInput {
    return {
      id: item.id,
      organizationId: item.organizationId,
      productId: item.productId,
      availableQuantity: item.availableQuantity,
      reservedQuantity: item.reservedQuantity,
      minimumQuantity: item.minimumQuantity,
    };
  }

  static toUpdatePersistence(item: InventoryItem): Prisma.InventoryItemUncheckedUpdateInput {
    return {
      availableQuantity: item.availableQuantity,
      reservedQuantity: item.reservedQuantity,
      minimumQuantity: item.minimumQuantity,
    };
  }
}

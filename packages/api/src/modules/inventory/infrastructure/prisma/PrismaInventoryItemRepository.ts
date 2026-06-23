import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  InventoryItemReadModel,
  InventoryItemRepository,
} from "../../application/repositories/InventoryItemRepository.js";
import type { InventoryItem } from "../../domain/entities/InventoryItem.js";
import { InventoryItemMapper } from "./InventoryItemMapper.js";

export class PrismaInventoryItemRepository implements InventoryItemRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByProductInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<InventoryItem | null> {
    const record = await this.prisma.getClient().inventoryItem.findFirst({
      where: { organizationId, productId },
    });

    return record ? InventoryItemMapper.toDomain(record) : null;
  }

  async findDetailsByProductInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<InventoryItemReadModel | null> {
    const record = await this.prisma.getClient().inventoryItem.findFirst({
      where: { organizationId, productId },
    });

    return record ? InventoryItemMapper.toReadModel(record) : null;
  }

  async existsForProduct(organizationId: string, productId: string): Promise<boolean> {
    const count = await this.prisma.getClient().inventoryItem.count({
      where: { organizationId, productId },
    });

    return count > 0;
  }

  async create(item: InventoryItem): Promise<InventoryItemReadModel> {
    const record = await this.prisma.getClient().inventoryItem.create({
      data: InventoryItemMapper.toPersistence(item),
    });

    return InventoryItemMapper.toReadModel(record);
  }

  async save(item: InventoryItem): Promise<InventoryItemReadModel> {
    const record = await this.prisma.getClient().inventoryItem.update({
      where: { id: item.id },
      data: InventoryItemMapper.toUpdatePersistence(item),
    });

    return InventoryItemMapper.toReadModel(record);
  }
}

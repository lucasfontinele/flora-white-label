import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  InventoryMovementReadModel,
  InventoryMovementRepository,
} from "../../application/repositories/InventoryMovementRepository.js";
import type { InventoryMovement } from "../../domain/entities/InventoryMovement.js";
import { InventoryMovementMapper } from "./InventoryMovementMapper.js";

export class PrismaInventoryMovementRepository implements InventoryMovementRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async append(movements: InventoryMovement[]): Promise<void> {
    if (movements.length === 0) {
      return;
    }

    await this.prisma.getClient().inventoryMovement.createMany({
      data: movements.map((movement) => InventoryMovementMapper.toPersistence(movement)),
    });
  }

  async listByProductInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<InventoryMovementReadModel[]> {
    const records = await this.prisma.getClient().inventoryMovement.findMany({
      where: { organizationId, productId },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => InventoryMovementMapper.toReadModel(record));
  }
}

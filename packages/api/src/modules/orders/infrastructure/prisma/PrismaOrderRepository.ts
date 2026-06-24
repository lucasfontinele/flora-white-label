import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  OrderReadModel,
  OrderRepository,
} from "../../application/repositories/OrderRepository.js";
import type { Order } from "../../domain/entities/Order.js";
import { OrderMapper } from "./OrderMapper.js";

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByIdInOrganization(organizationId: string, orderId: string): Promise<Order | null> {
    const record = await this.prisma.getClient().order.findFirst({
      where: { id: orderId, organizationId },
      include: { items: true },
    });

    return record ? OrderMapper.toDomain(record) : null;
  }

  async findDetailsByIdInOrganization(
    organizationId: string,
    orderId: string,
  ): Promise<OrderReadModel | null> {
    const record = await this.prisma.getClient().order.findFirst({
      where: { id: orderId, organizationId },
      include: { items: true },
    });

    return record ? OrderMapper.toReadModel(record) : null;
  }

  async findAllByOrganization(organizationId: string): Promise<OrderReadModel[]> {
    const records = await this.prisma.getClient().order.findMany({
      where: { organizationId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => OrderMapper.toReadModel(record));
  }

  async existsByToken(organizationId: string, token: string): Promise<boolean> {
    const count = await this.prisma.getClient().order.count({
      where: { organizationId, token },
    });

    return count > 0;
  }

  async create(order: Order): Promise<OrderReadModel> {
    const record = await this.prisma.getClient().order.create({
      data: OrderMapper.toPersistence(order),
      include: { items: true },
    });

    return OrderMapper.toReadModel(record);
  }

  async save(order: Order): Promise<OrderReadModel> {
    const record = await this.prisma.getClient().order.update({
      where: { id: order.id },
      data: OrderMapper.toUpdatePersistence(order),
      include: { items: true },
    });

    return OrderMapper.toReadModel(record);
  }
}

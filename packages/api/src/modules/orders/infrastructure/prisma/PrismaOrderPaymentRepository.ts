import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  OrderPaymentReadModel,
  OrderPaymentRepository,
} from "../../application/repositories/OrderPaymentRepository.js";
import type { OrderPayment } from "../../domain/entities/OrderPayment.js";
import { PaymentStatus } from "../../domain/enums/PaymentStatus.js";
import { OrderPaymentMapper } from "./OrderPaymentMapper.js";

export class PrismaOrderPaymentRepository implements OrderPaymentRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByIdInOrderInOrganization(
    organizationId: string,
    orderId: string,
    paymentId: string,
  ): Promise<OrderPayment | null> {
    const record = await this.prisma.getClient().orderPayment.findFirst({
      where: { id: paymentId, orderId, organizationId },
    });

    return record ? OrderPaymentMapper.toDomain(record) : null;
  }

  async findDetailsByIdInOrderInOrganization(
    organizationId: string,
    orderId: string,
    paymentId: string,
  ): Promise<OrderPaymentReadModel | null> {
    const record = await this.prisma.getClient().orderPayment.findFirst({
      where: { id: paymentId, orderId, organizationId },
    });

    return record ? OrderPaymentMapper.toReadModel(record) : null;
  }

  async findAllByOrderInOrganization(
    organizationId: string,
    orderId: string,
  ): Promise<OrderPaymentReadModel[]> {
    const records = await this.prisma.getClient().orderPayment.findMany({
      where: { orderId, organizationId },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => OrderPaymentMapper.toReadModel(record));
  }

  async existsPaidForOrder(organizationId: string, orderId: string): Promise<boolean> {
    const count = await this.prisma.getClient().orderPayment.count({
      where: {
        orderId,
        organizationId,
        status: { in: [PaymentStatus.Paid, PaymentStatus.Approved] },
      },
    });

    return count > 0;
  }

  async create(payment: OrderPayment): Promise<OrderPaymentReadModel> {
    const record = await this.prisma.getClient().orderPayment.create({
      data: OrderPaymentMapper.toPersistence(payment),
    });

    return OrderPaymentMapper.toReadModel(record);
  }

  async save(payment: OrderPayment): Promise<OrderPaymentReadModel> {
    const record = await this.prisma.getClient().orderPayment.update({
      where: { id: payment.id },
      data: OrderPaymentMapper.toUpdatePersistence(payment),
    });

    return OrderPaymentMapper.toReadModel(record);
  }
}

import type {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  Prisma,
} from "@prisma/client";
import type { OrderReadModel } from "../../application/repositories/OrderRepository.js";
import { Order } from "../../domain/entities/Order.js";
import { OrderDeliveryType } from "../../domain/enums/OrderDeliveryType.js";
import { OrderStatus } from "../../domain/enums/OrderStatus.js";
import { OrderItemMapper } from "./OrderItemMapper.js";

export type PrismaOrderWithItems = PrismaOrder & { items: PrismaOrderItem[] };

export type PrismaOrderWithRelations = PrismaOrderWithItems & {
  patient: { name: string };
  guardian: { name: string } | null;
};

export class OrderMapper {
  static toDomain(record: PrismaOrderWithItems): Order {
    return Order.restore(
      {
        organizationId: record.organizationId,
        token: record.token,
        patientId: record.patientId,
        guardianId: record.guardianId,
        status: record.status as OrderStatus,
        deliveryType: record.deliveryType as OrderDeliveryType,
        items: record.items.map((item) => OrderItemMapper.toDomain(item)),
      },
      record.id,
    );
  }

  static toReadModel(record: PrismaOrderWithItems): OrderReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      token: record.token,
      patientId: record.patientId,
      guardianId: record.guardianId,
      status: record.status as OrderStatus,
      deliveryType: record.deliveryType as OrderDeliveryType,
      itemsAmount: record.itemsAmount,
      items: record.items.map((item) => OrderItemMapper.toReadModel(item)),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toPersistence(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      id: order.id,
      organizationId: order.organizationId,
      token: order.token,
      patientId: order.patientId,
      guardianId: order.guardianId,
      status: order.status,
      deliveryType: order.deliveryType,
      itemsAmount: order.itemsAmount,
      items: {
        create: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          unitPriceInCents: item.unitPriceInCents,
          quantity: item.quantity,
        })),
      },
    };
  }

  static toUpdatePersistence(order: Order): Prisma.OrderUncheckedUpdateInput {
    return {
      status: order.status,
      deliveryType: order.deliveryType,
      itemsAmount: order.itemsAmount,
    };
  }
}

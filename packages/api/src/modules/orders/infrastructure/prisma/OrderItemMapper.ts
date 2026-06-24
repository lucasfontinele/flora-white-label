import type { OrderItem as PrismaOrderItem } from "@prisma/client";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type { OrderItemReadModel } from "../../application/repositories/OrderRepository.js";
import { OrderItem } from "../../domain/entities/OrderItem.js";

export class OrderItemMapper {
  static toDomain(record: PrismaOrderItem): OrderItem {
    return OrderItem.create(
      {
        orderId: record.orderId,
        productId: record.productId,
        unitPrice: MoneyInCents.create(record.unitPriceInCents),
        quantity: record.quantity,
      },
      record.id,
    );
  }

  static toReadModel(record: PrismaOrderItem): OrderItemReadModel {
    return {
      id: record.id,
      orderId: record.orderId,
      productId: record.productId,
      unitPriceInCents: record.unitPriceInCents,
      quantity: record.quantity,
    };
  }
}

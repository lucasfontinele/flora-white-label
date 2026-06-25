import type { OrderItem as PrismaOrderItem } from "@prisma/client";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type { OrderItemReadModel } from "../../application/repositories/OrderRepository.js";
import { OrderItem } from "../../domain/entities/OrderItem.js";

// The read model carries the product display name, so the persisted item must be
// loaded with its `product` relation selected.
export type PrismaOrderItemWithProduct = PrismaOrderItem & { product: { name: string } };

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

  static toReadModel(record: PrismaOrderItemWithProduct): OrderItemReadModel {
    return {
      id: record.id,
      orderId: record.orderId,
      productId: record.productId,
      productName: record.product.name,
      unitPriceInCents: record.unitPriceInCents,
      quantity: record.quantity,
    };
  }
}

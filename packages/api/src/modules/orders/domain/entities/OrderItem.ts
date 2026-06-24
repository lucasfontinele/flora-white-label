import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";

export interface OrderItemProps {
  orderId: string;
  productId: string;
  unitPrice: MoneyInCents;
  quantity: number;
}

export interface CreateOrderItemInput {
  orderId: string;
  productId: string;
  unitPrice: MoneyInCents;
  quantity: number;
}

/**
 * Entity inside the {@link Order} aggregate boundary. Represents one product
 * line of an order with its price frozen at order-creation time: `unitPrice` is
 * a snapshot of the product price and is never recalculated from the catalog.
 * Framework-agnostic: no Prisma/Fastify/Zod/HTTP dependency.
 */
export class OrderItem extends Entity<OrderItemProps> {
  private constructor(props: OrderItemProps, id?: string) {
    super(props, id);
  }

  static create(input: CreateOrderItemInput, id?: string): OrderItem {
    const orderId = input.orderId.trim();
    if (orderId.length === 0) {
      throw new DomainValidationError("OrderItem requires an orderId.");
    }

    const productId = input.productId.trim();
    if (productId.length === 0) {
      throw new DomainValidationError("OrderItem requires a productId.");
    }

    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new DomainValidationError("OrderItem quantity must be a positive integer.");
    }

    return new OrderItem(
      {
        orderId,
        productId,
        unitPrice: input.unitPrice,
        quantity: input.quantity,
      },
      id,
    );
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get unitPrice(): MoneyInCents {
    return this.props.unitPrice;
  }

  get unitPriceInCents(): number {
    return this.props.unitPrice.value;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get subtotalInCents(): number {
    return this.props.unitPrice.value * this.props.quantity;
  }
}

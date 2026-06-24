import type {
  OrderItemReadModel,
  OrderReadModel,
} from "../../application/repositories/OrderRepository.js";
import type { OrderDeliveryType } from "../../domain/enums/OrderDeliveryType.js";
import type { OrderStatus } from "../../domain/enums/OrderStatus.js";

export interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderResponse {
  id: string;
  organizationId: string;
  token: string;
  patientId: string;
  patientName: string;
  guardianId: string | null;
  guardianName: string | null;
  status: OrderStatus;
  deliveryType: OrderDeliveryType;
  itemsAmount: number;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export class OrderPresenter {
  static toHttp(order: OrderReadModel): OrderResponse {
    return {
      id: order.id,
      organizationId: order.organizationId,
      token: order.token,
      patientId: order.patientId,
      patientName: order.patientName,
      guardianId: order.guardianId,
      guardianName: order.guardianName,
      status: order.status,
      deliveryType: order.deliveryType,
      itemsAmount: order.itemsAmount,
      items: order.items.map((item) => OrderPresenter.toItemHttp(item)),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  private static toItemHttp(item: OrderItemReadModel): OrderItemResponse {
    return {
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      unitPrice: item.unitPriceInCents,
      quantity: item.quantity,
    };
  }
}

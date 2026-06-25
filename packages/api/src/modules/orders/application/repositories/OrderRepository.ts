import type { Order } from "../../domain/entities/Order.js";
import type { OrderDeliveryType } from "../../domain/enums/OrderDeliveryType.js";
import type { OrderStatus } from "../../domain/enums/OrderStatus.js";

export interface OrderItemReadModel {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  unitPriceInCents: number;
  quantity: number;
}

export interface OrderReadModel {
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
  items: OrderItemReadModel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderRepository {
  findByIdInOrganization(organizationId: string, orderId: string): Promise<Order | null>;
  findDetailsByIdInOrganization(
    organizationId: string,
    orderId: string,
  ): Promise<OrderReadModel | null>;
  findAllByOrganization(
    organizationId: string,
    statuses?: OrderStatus[],
  ): Promise<OrderReadModel[]>;
  existsByToken(organizationId: string, token: string): Promise<boolean>;
  create(order: Order): Promise<OrderReadModel>;
  save(order: Order): Promise<OrderReadModel>;
}

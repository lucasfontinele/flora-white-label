import type { ProductCategory } from "../../../products/domain/enums/ProductCategory.js";
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
    patientId?: string,
  ): Promise<OrderReadModel[]>;
  existsByToken(organizationId: string, token: string): Promise<boolean>;
  /**
   * Sums the quantity of a product ordered by a patient within `[from, to)`,
   * excluding cancelled orders. Used to enforce posology purchase limits.
   */
  sumProductQuantityInRange(
    organizationId: string,
    patientId: string,
    productId: string,
    from: Date,
    to: Date,
  ): Promise<number>;
  /**
   * Sums the quantity ordered by a patient across all products of a category
   * within `[from, to)`, excluding cancelled orders. Used to enforce
   * category-scoped posology limits.
   */
  sumCategoryQuantityInRange(
    organizationId: string,
    patientId: string,
    category: ProductCategory,
    from: Date,
    to: Date,
  ): Promise<number>;
  create(order: Order): Promise<OrderReadModel>;
  save(order: Order): Promise<OrderReadModel>;
}

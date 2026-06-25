import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { OrderReadModel, OrderRepository } from "../repositories/OrderRepository.js";

/**
 * The fulfillment outcomes an operator can set from the order detail screen:
 * either the order is ready to be picked up at the site, or it has been handed
 * over to the postal service (awaiting correios).
 */
export type OrderFulfillmentTarget = "READY_FOR_PICKUP" | "SHIPPED";

export interface UpdateOrderFulfillmentStatusInput {
  organizationId: string;
  orderId: string;
  target: OrderFulfillmentTarget;
}

export interface UpdateOrderFulfillmentStatusDependencies {
  orderRepository: OrderRepository;
  unitOfWork: UnitOfWork;
}

export class UpdateOrderFulfillmentStatusUseCase {
  constructor(private readonly deps: UpdateOrderFulfillmentStatusDependencies) {}

  async execute(input: UpdateOrderFulfillmentStatusInput): Promise<OrderReadModel> {
    const order = await this.deps.orderRepository.findByIdInOrganization(
      input.organizationId,
      input.orderId,
    );

    if (!order) {
      throw new NotFoundError("Order not found.");
    }

    if (input.target === "READY_FOR_PICKUP") {
      order.markReadyForPickup();
    } else {
      order.markShipped();
    }

    return this.deps.unitOfWork.execute(() => this.deps.orderRepository.save(order));
  }
}

import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { OrderReadModel, OrderRepository } from "../repositories/OrderRepository.js";

export interface GetOrderByIdInput {
  organizationId: string;
  orderId: string;
}

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(input: GetOrderByIdInput): Promise<OrderReadModel> {
    const order = await this.orderRepository.findDetailsByIdInOrganization(
      input.organizationId,
      input.orderId,
    );

    if (!order) {
      throw new NotFoundError("Order not found.");
    }

    return order;
  }
}

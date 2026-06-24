import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { OrderReadModel, OrderRepository } from "../repositories/OrderRepository.js";

export interface CancelOrderInput {
  organizationId: string;
  orderId: string;
}

export interface CancelOrderDependencies {
  orderRepository: OrderRepository;
  unitOfWork: UnitOfWork;
}

export class CancelOrderUseCase {
  constructor(private readonly deps: CancelOrderDependencies) {}

  async execute(input: CancelOrderInput): Promise<OrderReadModel> {
    const order = await this.deps.orderRepository.findByIdInOrganization(
      input.organizationId,
      input.orderId,
    );

    if (!order) {
      throw new NotFoundError("Order not found.");
    }

    order.cancel();

    return this.deps.unitOfWork.execute(() => this.deps.orderRepository.save(order));
  }
}

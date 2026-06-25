import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type {
  OrderPaymentReadModel,
  OrderPaymentRepository,
} from "../repositories/OrderPaymentRepository.js";
import type { OrderRepository } from "../repositories/OrderRepository.js";

export interface ListOrderPaymentsInput {
  organizationId: string;
  orderId: string;
}

export interface ListOrderPaymentsOutput {
  data: OrderPaymentReadModel[];
}

export interface ListOrderPaymentsDependencies {
  orderRepository: OrderRepository;
  orderPaymentRepository: OrderPaymentRepository;
}

export class ListOrderPaymentsUseCase {
  constructor(private readonly deps: ListOrderPaymentsDependencies) {}

  async execute(input: ListOrderPaymentsInput): Promise<ListOrderPaymentsOutput> {
    const order = await this.deps.orderRepository.findDetailsByIdInOrganization(
      input.organizationId,
      input.orderId,
    );
    if (!order) {
      throw new NotFoundError("Order not found.");
    }

    const data = await this.deps.orderPaymentRepository.findAllByOrderInOrganization(
      input.organizationId,
      input.orderId,
    );

    return { data };
  }
}

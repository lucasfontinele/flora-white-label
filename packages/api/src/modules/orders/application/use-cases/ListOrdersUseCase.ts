import type { OrderStatus } from "../../domain/enums/OrderStatus.js";
import type { OrderReadModel, OrderRepository } from "../repositories/OrderRepository.js";

export interface ListOrdersInput {
  organizationId: string;
  statuses?: OrderStatus[];
}

export interface ListOrdersOutput {
  data: OrderReadModel[];
}

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(input: ListOrdersInput): Promise<ListOrdersOutput> {
    const statuses = input.statuses && input.statuses.length > 0 ? input.statuses : undefined;
    const data = await this.orderRepository.findAllByOrganization(input.organizationId, statuses);

    return { data };
  }
}

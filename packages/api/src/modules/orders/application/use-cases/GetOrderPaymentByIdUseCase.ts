import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type {
  OrderPaymentReadModel,
  OrderPaymentRepository,
} from "../repositories/OrderPaymentRepository.js";

export interface GetOrderPaymentByIdInput {
  organizationId: string;
  orderId: string;
  paymentId: string;
}

export class GetOrderPaymentByIdUseCase {
  constructor(private readonly orderPaymentRepository: OrderPaymentRepository) {}

  async execute(input: GetOrderPaymentByIdInput): Promise<OrderPaymentReadModel> {
    const payment = await this.orderPaymentRepository.findDetailsByIdInOrderInOrganization(
      input.organizationId,
      input.orderId,
      input.paymentId,
    );

    if (!payment) {
      throw new NotFoundError("Payment not found.");
    }

    return payment;
  }
}

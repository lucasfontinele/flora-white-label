import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { PaymentGatewayService } from "../gateway/PaymentGatewayService.js";
import type {
  OrderPaymentReadModel,
  OrderPaymentRepository,
} from "../repositories/OrderPaymentRepository.js";

export interface SyncOrderPaymentStatusInput {
  organizationId: string;
  orderId: string;
  paymentId: string;
}

export interface SyncOrderPaymentStatusDependencies {
  orderPaymentRepository: OrderPaymentRepository;
  paymentGateway: PaymentGatewayService;
  unitOfWork: UnitOfWork;
}

export class SyncOrderPaymentStatusUseCase {
  constructor(private readonly deps: SyncOrderPaymentStatusDependencies) {}

  async execute(input: SyncOrderPaymentStatusInput): Promise<OrderPaymentReadModel> {
    const payment = await this.deps.orderPaymentRepository.findByIdInOrderInOrganization(
      input.organizationId,
      input.orderId,
      input.paymentId,
    );
    if (!payment) {
      throw new NotFoundError("Payment not found.");
    }

    const externalPaymentId = payment.externalPaymentId;
    if (!externalPaymentId) {
      throw new DomainValidationError("Payment has no external gateway reference to sync.");
    }

    const { status } = await this.deps.paymentGateway.getPaymentStatus(externalPaymentId);

    // Syncing the payment status never changes the Order status in this phase.
    payment.syncStatus(status);

    return this.deps.unitOfWork.execute(() => this.deps.orderPaymentRepository.save(payment));
  }
}

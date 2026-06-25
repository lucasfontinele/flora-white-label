import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { DiscountRate } from "../../../../shared/domain/value-objects/DiscountRate.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { OrderPayment } from "../../domain/entities/OrderPayment.js";
import type { PaymentMethod } from "../../domain/enums/PaymentMethod.js";
import type { PaymentGatewayService } from "../gateway/PaymentGatewayService.js";
import type {
  OrderPaymentReadModel,
  OrderPaymentRepository,
} from "../repositories/OrderPaymentRepository.js";
import type { OrderRepository } from "../repositories/OrderRepository.js";

export interface CreateOrderPaymentInput {
  organizationId: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  discount?: number | null;
}

export interface CreateOrderPaymentDependencies {
  orderRepository: OrderRepository;
  orderPaymentRepository: OrderPaymentRepository;
  paymentGateway: PaymentGatewayService;
  unitOfWork: UnitOfWork;
}

export class CreateOrderPaymentUseCase {
  constructor(private readonly deps: CreateOrderPaymentDependencies) {}

  async execute(input: CreateOrderPaymentInput): Promise<OrderPaymentReadModel> {
    const order = await this.deps.orderRepository.findByIdInOrganization(
      input.organizationId,
      input.orderId,
    );
    if (!order) {
      throw new NotFoundError("Order not found.");
    }

    order.ensureMutable();

    const alreadyPaid = await this.deps.orderPaymentRepository.existsPaidForOrder(
      input.organizationId,
      input.orderId,
    );
    if (alreadyPaid) {
      throw new ConflictError("Order already has a settled payment.");
    }

    const discount =
      input.discount === undefined || input.discount === null
        ? null
        : DiscountRate.create(input.discount);

    const grossAmount = order.grossAmountInCents;
    const totalPaidInCents = discount
      ? Math.round(grossAmount * (1 - discount.value))
      : grossAmount;

    const payment = OrderPayment.create({
      orderId: order.id,
      organizationId: order.organizationId,
      totalPaid: MoneyInCents.create(totalPaidInCents),
      discount,
      paymentMethod: input.paymentMethod,
    });

    // Charge the gateway BEFORE persisting so a gateway failure leaves no orphan
    // local payment. The gateway call runs outside the DB transaction.
    const gatewayResult = await this.deps.paymentGateway.createPayment({
      orderId: order.id,
      organizationId: order.organizationId,
      paymentMethod: input.paymentMethod,
      amountInCents: totalPaidInCents,
      description: `Order ${order.token}`,
      metadata: { orderId: order.id, orderToken: order.token },
    });

    payment.attachGatewayReference({
      externalPaymentId: gatewayResult.externalPaymentId,
      checkoutUrl: gatewayResult.checkoutUrl,
      pixQrCode: gatewayResult.pixQrCode,
      pixQrCodeBase64: gatewayResult.pixQrCodeBase64,
      expiresAt: gatewayResult.expiresAt,
    });

    return this.deps.unitOfWork.execute(() => this.deps.orderPaymentRepository.create(payment));
  }
}

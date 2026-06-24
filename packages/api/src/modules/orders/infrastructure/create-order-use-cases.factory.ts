import { env } from "../../../config/env.js";
import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { PrismaPatientRepository } from "../../patients/infrastructure/prisma/PrismaPatientRepository.js";
import { PrismaProductRepository } from "../../products/infrastructure/prisma/PrismaProductRepository.js";
import type { PaymentGatewayService } from "../application/gateway/PaymentGatewayService.js";
import { CancelOrderUseCase } from "../application/use-cases/CancelOrderUseCase.js";
import { CreateOrderPaymentUseCase } from "../application/use-cases/CreateOrderPaymentUseCase.js";
import { CreateOrderUseCase } from "../application/use-cases/CreateOrderUseCase.js";
import { GetOrderByIdUseCase } from "../application/use-cases/GetOrderByIdUseCase.js";
import { GetOrderPaymentByIdUseCase } from "../application/use-cases/GetOrderPaymentByIdUseCase.js";
import { ListOrderPaymentsUseCase } from "../application/use-cases/ListOrderPaymentsUseCase.js";
import { ListOrdersUseCase } from "../application/use-cases/ListOrdersUseCase.js";
import { SyncOrderPaymentStatusUseCase } from "../application/use-cases/SyncOrderPaymentStatusUseCase.js";
import { AbacatePayPaymentGatewayService } from "./gateway/AbacatePayPaymentGatewayService.js";
import { PrismaOrderPaymentRepository } from "./prisma/PrismaOrderPaymentRepository.js";
import { PrismaOrderRepository } from "./prisma/PrismaOrderRepository.js";

export interface OrderUseCases {
  createOrderUseCase: CreateOrderUseCase;
  listOrdersUseCase: ListOrdersUseCase;
  getOrderByIdUseCase: GetOrderByIdUseCase;
  cancelOrderUseCase: CancelOrderUseCase;
  createOrderPaymentUseCase: CreateOrderPaymentUseCase;
  listOrderPaymentsUseCase: ListOrderPaymentsUseCase;
  getOrderPaymentByIdUseCase: GetOrderPaymentByIdUseCase;
  syncOrderPaymentStatusUseCase: SyncOrderPaymentStatusUseCase;
}

function makePaymentGateway(): PaymentGatewayService {
  return new AbacatePayPaymentGatewayService({
    apiKey: env.ABACATEPAY_API_KEY,
    baseUrl: env.ABACATEPAY_BASE_URL,
  });
}

export function makeOrderUseCases(prisma: PrismaService): OrderUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const orderRepository = new PrismaOrderRepository(transactionManager);
  const orderPaymentRepository = new PrismaOrderPaymentRepository(transactionManager);
  const productRepository = new PrismaProductRepository(transactionManager);
  const patientRepository = new PrismaPatientRepository(transactionManager);
  const paymentGateway = makePaymentGateway();

  return {
    createOrderUseCase: new CreateOrderUseCase({
      orderRepository,
      productRepository,
      patientRepository,
      unitOfWork: transactionManager,
    }),
    listOrdersUseCase: new ListOrdersUseCase(orderRepository),
    getOrderByIdUseCase: new GetOrderByIdUseCase(orderRepository),
    cancelOrderUseCase: new CancelOrderUseCase({
      orderRepository,
      unitOfWork: transactionManager,
    }),
    createOrderPaymentUseCase: new CreateOrderPaymentUseCase({
      orderRepository,
      orderPaymentRepository,
      paymentGateway,
      unitOfWork: transactionManager,
    }),
    listOrderPaymentsUseCase: new ListOrderPaymentsUseCase({
      orderRepository,
      orderPaymentRepository,
    }),
    getOrderPaymentByIdUseCase: new GetOrderPaymentByIdUseCase(orderPaymentRepository),
    syncOrderPaymentStatusUseCase: new SyncOrderPaymentStatusUseCase({
      orderPaymentRepository,
      paymentGateway,
      unitOfWork: transactionManager,
    }),
  };
}

import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type {
  PatientReadModel,
  PatientRepository,
} from "../../../patients/application/repositories/PatientRepository.js";
import type { Product } from "../../../products/domain/entities/Product.js";
import type { ProductRepository } from "../../../products/application/repositories/ProductRepository.js";
import type { Order } from "../../domain/entities/Order.js";
import type { OrderPayment } from "../../domain/entities/OrderPayment.js";
import type { OrderStatus } from "../../domain/enums/OrderStatus.js";
import { PaymentStatus } from "../../domain/enums/PaymentStatus.js";
import type {
  CreatePaymentGatewayInput,
  CreatePaymentGatewayOutput,
  PaymentGatewayService,
  PaymentGatewayStatusOutput,
} from "../gateway/PaymentGatewayService.js";
import type {
  OrderPaymentReadModel,
  OrderPaymentRepository,
} from "../repositories/OrderPaymentRepository.js";
import type { OrderReadModel, OrderRepository } from "../repositories/OrderRepository.js";

export const fixedNow = new Date("2026-06-24T12:00:00.000Z");

export const immediateUnitOfWork: UnitOfWork = {
  execute: <T>(work: () => Promise<T>) => work(),
};

export function fakeProduct(input: {
  id: string;
  priceInCents: number;
  isActive?: boolean;
}): Product {
  return {
    id: input.id,
    priceInCents: input.priceInCents,
    isActive: input.isActive ?? true,
  } as unknown as Product;
}

export function toOrderReadModel(
  order: Order,
  createdAt = fixedNow,
  updatedAt = fixedNow,
): OrderReadModel {
  return {
    id: order.id,
    organizationId: order.organizationId,
    token: order.token,
    patientId: order.patientId,
    patientName: `Patient ${order.patientId}`,
    guardianId: order.guardianId,
    guardianName: order.guardianId ? `Guardian ${order.guardianId}` : null,
    status: order.status,
    deliveryType: order.deliveryType,
    itemsAmount: order.itemsAmount,
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: `Product ${item.productId}`,
      unitPriceInCents: item.unitPriceInCents,
      quantity: item.quantity,
    })),
    createdAt,
    updatedAt,
  };
}

export function toOrderPaymentReadModel(
  payment: OrderPayment,
  createdAt = fixedNow,
  updatedAt = fixedNow,
): OrderPaymentReadModel {
  return {
    id: payment.id,
    orderId: payment.orderId,
    organizationId: payment.organizationId,
    totalPaidInCents: payment.totalPaidInCents,
    discount: payment.discountValue,
    paymentMethod: payment.paymentMethod,
    status: payment.status,
    externalPaymentId: payment.externalPaymentId,
    checkoutUrl: payment.checkoutUrl,
    pixQrCode: payment.pixQrCode,
    pixQrCodeBase64: payment.pixQrCodeBase64,
    expiresAt: payment.expiresAt,
    createdAt,
    updatedAt,
  };
}

export class InMemoryOrderRepository implements OrderRepository {
  readonly orders = new Map<string, Order>();
  createCalls = 0;
  saveCalls = 0;

  async findByIdInOrganization(organizationId: string, orderId: string): Promise<Order | null> {
    const order = this.orders.get(orderId);

    return order && order.organizationId === organizationId ? order : null;
  }

  async findDetailsByIdInOrganization(
    organizationId: string,
    orderId: string,
  ): Promise<OrderReadModel | null> {
    const order = this.orders.get(orderId);

    return order && order.organizationId === organizationId ? toOrderReadModel(order) : null;
  }

  async findAllByOrganization(
    organizationId: string,
    statuses?: OrderStatus[],
  ): Promise<OrderReadModel[]> {
    return [...this.orders.values()]
      .filter((order) => order.organizationId === organizationId)
      .filter((order) => !statuses || statuses.length === 0 || statuses.includes(order.status))
      .map((order) => toOrderReadModel(order));
  }

  async existsByToken(organizationId: string, token: string): Promise<boolean> {
    return [...this.orders.values()].some(
      (order) => order.organizationId === organizationId && order.token === token,
    );
  }

  async create(order: Order): Promise<OrderReadModel> {
    this.createCalls += 1;
    this.orders.set(order.id, order);

    return toOrderReadModel(order);
  }

  async save(order: Order): Promise<OrderReadModel> {
    this.saveCalls += 1;
    this.orders.set(order.id, order);

    return toOrderReadModel(order);
  }

  seed(order: Order): void {
    this.orders.set(order.id, order);
  }
}

export class InMemoryOrderPaymentRepository implements OrderPaymentRepository {
  readonly payments = new Map<string, OrderPayment>();
  createCalls = 0;
  saveCalls = 0;

  async findByIdInOrderInOrganization(
    organizationId: string,
    orderId: string,
    paymentId: string,
  ): Promise<OrderPayment | null> {
    const payment = this.payments.get(paymentId);

    return payment &&
      payment.organizationId === organizationId &&
      payment.orderId === orderId
      ? payment
      : null;
  }

  async findDetailsByIdInOrderInOrganization(
    organizationId: string,
    orderId: string,
    paymentId: string,
  ): Promise<OrderPaymentReadModel | null> {
    const payment = await this.findByIdInOrderInOrganization(organizationId, orderId, paymentId);

    return payment ? toOrderPaymentReadModel(payment) : null;
  }

  async findAllByOrderInOrganization(
    organizationId: string,
    orderId: string,
  ): Promise<OrderPaymentReadModel[]> {
    return [...this.payments.values()]
      .filter(
        (payment) => payment.organizationId === organizationId && payment.orderId === orderId,
      )
      .map((payment) => toOrderPaymentReadModel(payment));
  }

  async existsPaidForOrder(organizationId: string, orderId: string): Promise<boolean> {
    return [...this.payments.values()].some(
      (payment) =>
        payment.organizationId === organizationId &&
        payment.orderId === orderId &&
        (payment.status === PaymentStatus.Paid || payment.status === PaymentStatus.Approved),
    );
  }

  async create(payment: OrderPayment): Promise<OrderPaymentReadModel> {
    this.createCalls += 1;
    this.payments.set(payment.id, payment);

    return toOrderPaymentReadModel(payment);
  }

  async save(payment: OrderPayment): Promise<OrderPaymentReadModel> {
    this.saveCalls += 1;
    this.payments.set(payment.id, payment);

    return toOrderPaymentReadModel(payment);
  }

  seed(payment: OrderPayment): void {
    this.payments.set(payment.id, payment);
  }
}

export class FakeProductRepository implements ProductRepository {
  readonly products = new Map<string, Product>();

  constructor(products: Product[] = []) {
    for (const product of products) {
      this.products.set(product.id, product);
    }
  }

  async findByIdInOrganization(
    _organizationId: string,
    productId: string,
  ): Promise<Product | null> {
    return this.products.get(productId) ?? null;
  }

  async findDetailsByIdInOrganization(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async findAllByOrganization(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async create(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async save(): Promise<never> {
    throw new Error("Method not implemented.");
  }
}

export class FakePatientRepository implements PatientRepository {
  private readonly patients = new Map<string, { guardianId: string | null }>();

  constructor(patients: { id: string; guardianId?: string | null }[] = []) {
    for (const patient of patients) {
      this.patients.set(patient.id, { guardianId: patient.guardianId ?? null });
    }
  }

  async findByIdInOrganization(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async findDetailsByIdInOrganization(
    _organizationId: string,
    patientId: string,
  ): Promise<PatientReadModel | null> {
    const patient = this.patients.get(patientId);

    return patient ? ({ guardianId: patient.guardianId } as unknown as PatientReadModel) : null;
  }

  async findManyByOrganization(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async findByDocument(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async create(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async save(): Promise<never> {
    throw new Error("Method not implemented.");
  }
}

export class FakePaymentGatewayService implements PaymentGatewayService {
  createCalls: CreatePaymentGatewayInput[] = [];
  statusCalls: string[] = [];
  createResult: CreatePaymentGatewayOutput = {
    externalPaymentId: "gateway-ext-1",
    checkoutUrl: null,
    pixQrCode: "00020126-pix-copy-paste",
    pixQrCodeBase64: "data:image/png;base64,AAAA",
    expiresAt: null,
    status: PaymentStatus.Pending,
  };
  statusResult: PaymentGatewayStatusOutput = { status: PaymentStatus.Paid };
  createError: Error | null = null;

  async createPayment(input: CreatePaymentGatewayInput): Promise<CreatePaymentGatewayOutput> {
    this.createCalls.push(input);

    if (this.createError) {
      throw this.createError;
    }

    return this.createResult;
  }

  async getPaymentStatus(externalPaymentId: string): Promise<PaymentGatewayStatusOutput> {
    this.statusCalls.push(externalPaymentId);

    return this.statusResult;
  }
}

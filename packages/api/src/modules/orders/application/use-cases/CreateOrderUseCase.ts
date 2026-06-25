import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import type { ProductRepository } from "../../../products/application/repositories/ProductRepository.js";
import { Order } from "../../domain/entities/Order.js";
import type { OrderDeliveryType } from "../../domain/enums/OrderDeliveryType.js";
import type { CreateOrderItemData } from "../../domain/entities/Order.js";
import type { OrderReadModel, OrderRepository } from "../repositories/OrderRepository.js";

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  organizationId: string;
  patientId: string;
  guardianId?: string | null;
  deliveryType: OrderDeliveryType;
  items: CreateOrderItemInput[];
}

export interface CreateOrderDependencies {
  orderRepository: OrderRepository;
  productRepository: ProductRepository;
  patientRepository: PatientRepository;
  unitOfWork: UnitOfWork;
}

const MAX_TOKEN_ATTEMPTS = 5;

export class CreateOrderUseCase {
  constructor(private readonly deps: CreateOrderDependencies) {}

  async execute(input: CreateOrderInput): Promise<OrderReadModel> {
    const patient = await this.deps.patientRepository.findDetailsByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!patient) {
      throw new NotFoundError("Patient not found.");
    }

    const guardianId = input.guardianId?.trim() ? input.guardianId.trim() : null;
    if (guardianId && guardianId !== patient.guardianId) {
      throw new DomainValidationError("Guardian does not match the patient's responsible.");
    }

    const items = await this.resolveItems(input);
    const token = await this.generateUniqueToken(input.organizationId);

    const order = Order.create({
      organizationId: input.organizationId,
      patientId: input.patientId,
      guardianId,
      deliveryType: input.deliveryType,
      items,
      token,
    });

    return this.deps.unitOfWork.execute(() => this.deps.orderRepository.create(order));
  }

  private async resolveItems(input: CreateOrderInput): Promise<CreateOrderItemData[]> {
    const resolved: CreateOrderItemData[] = [];

    for (const item of input.items) {
      const product = await this.deps.productRepository.findByIdInOrganization(
        input.organizationId,
        item.productId,
      );
      if (!product) {
        throw new NotFoundError(`Product ${item.productId} not found.`);
      }

      if (!product.isActive) {
        throw new DomainValidationError(`Product ${item.productId} is not active.`);
      }

      // Extension point: when a patient product/category-access rule exists in
      // the project, enforce here that `product` is released to the patient.
      // No such rule exists yet, so the check is intentionally a no-op.

      resolved.push({
        productId: product.id,
        unitPriceInCents: product.priceInCents,
        quantity: item.quantity,
      });
    }

    return resolved;
  }

  private async generateUniqueToken(organizationId: string): Promise<string> {
    for (let attempt = 0; attempt < MAX_TOKEN_ATTEMPTS; attempt += 1) {
      const candidate = Order.generateToken();
      const exists = await this.deps.orderRepository.existsByToken(organizationId, candidate);

      if (!exists) {
        return candidate;
      }
    }

    throw new ConflictError("Could not generate a unique order token.");
  }
}

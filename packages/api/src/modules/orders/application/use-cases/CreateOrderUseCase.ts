import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import type {
  PatientPrescriptionReadModel,
  PatientPrescriptionRepository,
} from "../../../prescriptions/application/repositories/PatientPrescriptionRepository.js";
import { PrescriptionPeriod } from "../../../prescriptions/domain/enums/PrescriptionPeriod.js";
import { currentPeriodWindow } from "../../../prescriptions/domain/posology-window.js";
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
  prescriptionRepository: PatientPrescriptionRepository;
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

    const prescription = await this.deps.prescriptionRepository.findDetailsByPatient(
      input.organizationId,
      input.patientId,
    );
    if (!prescription) {
      throw new ConflictError("O paciente não possui receita ativa para realizar pedidos.");
    }
    if (prescription.validUntil.getTime() <= Date.now()) {
      throw new ConflictError("A receita do paciente está vencida. Solicite uma nova receita.");
    }

    const items = await this.resolveItems(input, prescription);
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

  private async resolveItems(
    input: CreateOrderInput,
    prescription: PatientPrescriptionReadModel,
  ): Promise<CreateOrderItemData[]> {
    const resolved: CreateOrderItemData[] = [];
    // Total quantity requested per product (an order may list a product twice).
    const requestedByProduct = new Map<string, { quantity: number; name: string }>();

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

      const previous = requestedByProduct.get(product.id);
      requestedByProduct.set(product.id, {
        name: product.name,
        quantity: (previous?.quantity ?? 0) + item.quantity,
      });

      resolved.push({
        productId: product.id,
        unitPriceInCents: product.priceInCents,
        quantity: item.quantity,
      });
    }

    await this.enforcePosology(input, prescription, requestedByProduct);

    return resolved;
  }

  /**
   * Enforces, per product, that the requested quantity plus what the patient has
   * already consumed in the current period does not exceed the posology
   * allowance. A product without a posology line cannot be ordered at all.
   */
  private async enforcePosology(
    input: CreateOrderInput,
    prescription: PatientPrescriptionReadModel,
    requestedByProduct: Map<string, { quantity: number; name: string }>,
  ): Promise<void> {
    const posologyByProduct = new Map(
      prescription.items.map((item) => [item.productId, item]),
    );

    for (const [productId, requested] of requestedByProduct) {
      const posology = posologyByProduct.get(productId);
      if (!posology) {
        throw new ConflictError(
          `O produto "${requested.name}" não está na posologia da receita do paciente.`,
        );
      }

      const window = currentPeriodWindow(posology.period);
      const used = await this.deps.orderRepository.sumProductQuantityInRange(
        input.organizationId,
        input.patientId,
        productId,
        window.from,
        window.to,
      );

      if (used + requested.quantity > posology.allowedQuantity) {
        const periodLabel = posology.period === PrescriptionPeriod.Monthly ? "mês" : "ano";
        const remaining = Math.max(posology.allowedQuantity - used, 0);
        throw new ConflictError(
          `Limite da posologia excedido para "${requested.name}": permitido ${posology.allowedQuantity} por ${periodLabel}, ` +
            `já utilizado ${used}, restante ${remaining}, solicitado ${requested.quantity}.`,
        );
      }
    }
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

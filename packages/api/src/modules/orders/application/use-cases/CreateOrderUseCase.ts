import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import type {
  PatientPrescriptionReadModel,
  PatientPrescriptionRepository,
} from "../../../prescriptions/application/repositories/PatientPrescriptionRepository.js";
import { PrescriptionItemScope } from "../../../prescriptions/domain/enums/PrescriptionItemScope.js";
import { PrescriptionPeriod } from "../../../prescriptions/domain/enums/PrescriptionPeriod.js";
import { currentPeriodWindow } from "../../../prescriptions/domain/posology-window.js";
import type { ProductRepository } from "../../../products/application/repositories/ProductRepository.js";
import type { ProductCategory } from "../../../products/domain/enums/ProductCategory.js";
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
    // Total quantity requested per product (an order may list a product twice),
    // carrying the product's display name + category for posology enforcement.
    const requestedByProduct = new Map<
      string,
      { quantity: number; name: string; category: ProductCategory }
    >();

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
        category: product.category,
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
   * Enforces that every requested product is covered by the posology and stays
   * within its allowance for the current period. A product is matched first by a
   * product-scoped line (limit per product) and otherwise by a category-scoped
   * line (limit summed across the whole category). A product matched by neither
   * cannot be ordered.
   */
  private async enforcePosology(
    input: CreateOrderInput,
    prescription: PatientPrescriptionReadModel,
    requestedByProduct: Map<string, { quantity: number; name: string; category: ProductCategory }>,
  ): Promise<void> {
    const productRules = new Map(
      prescription.items
        .filter((item) => item.scope === PrescriptionItemScope.Product && item.productId)
        .map((item) => [item.productId as string, item]),
    );
    const categoryRules = new Map(
      prescription.items
        .filter((item) => item.scope === PrescriptionItemScope.Category && item.category)
        .map((item) => [item.category as ProductCategory, item]),
    );

    // Requested quantity grouped per governing category rule (so multiple
    // products of the same category share the category allowance).
    const requestedByCategory = new Map<ProductCategory, number>();

    for (const [productId, requested] of requestedByProduct) {
      const productRule = productRules.get(productId);

      if (productRule) {
        const window = currentPeriodWindow(productRule.period);
        const used = await this.deps.orderRepository.sumProductQuantityInRange(
          input.organizationId,
          input.patientId,
          productId,
          window.from,
          window.to,
        );
        this.ensureWithinAllowance(productRule, requested.name, used, requested.quantity);
        continue;
      }

      if (categoryRules.has(requested.category)) {
        requestedByCategory.set(
          requested.category,
          (requestedByCategory.get(requested.category) ?? 0) + requested.quantity,
        );
        continue;
      }

      throw new ConflictError(
        `O produto "${requested.name}" não está na posologia da receita do paciente.`,
      );
    }

    for (const [category, quantity] of requestedByCategory) {
      const rule = categoryRules.get(category);
      if (!rule) continue;

      const window = currentPeriodWindow(rule.period);
      const used = await this.deps.orderRepository.sumCategoryQuantityInRange(
        input.organizationId,
        input.patientId,
        category,
        window.from,
        window.to,
      );
      this.ensureWithinAllowance(rule, `categoria ${category}`, used, quantity);
    }
  }

  private ensureWithinAllowance(
    rule: { allowedQuantity: number; period: PrescriptionPeriod },
    label: string,
    used: number,
    requested: number,
  ): void {
    if (used + requested <= rule.allowedQuantity) {
      return;
    }

    const periodLabel = rule.period === PrescriptionPeriod.Monthly ? "mês" : "ano";
    const remaining = Math.max(rule.allowedQuantity - used, 0);
    throw new ConflictError(
      `Limite da posologia excedido para "${label}": permitido ${rule.allowedQuantity} por ${periodLabel}, ` +
        `já utilizado ${used}, restante ${remaining}, solicitado ${requested}.`,
    );
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

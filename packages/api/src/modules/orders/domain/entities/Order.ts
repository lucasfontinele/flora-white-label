import { randomBytes, randomUUID } from "node:crypto";
import { AggregateRoot } from "../../../../shared/domain/entities/AggregateRoot.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { OrderDeliveryType } from "../enums/OrderDeliveryType.js";
import { OrderStatus } from "../enums/OrderStatus.js";
import { OrderItem } from "./OrderItem.js";

export interface OrderProps {
  organizationId: string;
  token: string;
  patientId: string;
  guardianId: string | null;
  status: OrderStatus;
  deliveryType: OrderDeliveryType;
  items: OrderItem[];
}

export interface CreateOrderItemData {
  productId: string;
  unitPriceInCents: number;
  quantity: number;
}

export interface CreateOrderInput {
  organizationId: string;
  patientId: string;
  guardianId?: string | null;
  deliveryType: OrderDeliveryType;
  items: CreateOrderItemData[];
  /** Optional pre-generated token (e.g. uniqueness retry). Generated when absent. */
  token?: string;
}

export interface RestoreOrderInput {
  organizationId: string;
  token: string;
  patientId: string;
  guardianId: string | null;
  status: OrderStatus;
  deliveryType: OrderDeliveryType;
  items: OrderItem[];
}

const TOKEN_PREFIX = "ORD-";
// Crockford base32 alphabet (no I, L, O, U) for readable, unambiguous tokens.
const TOKEN_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const TOKEN_BODY_LENGTH = 6;

/**
 * Aggregate Root for a patient's product order within an organization. It owns
 * the invariants "at least one item", the derived `itemsAmount` (sum of item
 * quantities), the readable backend-generated `token`, the initial `REQUESTED`
 * status, and the rule that a `CANCELLED` order can no longer change. Item
 * prices are frozen by the application before items reach the aggregate. The
 * order never reserves or decrements inventory. No infrastructure dependency.
 */
export class Order extends AggregateRoot<OrderProps> {
  private constructor(props: OrderProps, id?: string) {
    super(props, id);
  }

  static create(input: CreateOrderInput, id?: string): Order {
    const organizationId = input.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("Order requires an organizationId.");
    }

    const patientId = input.patientId.trim();
    if (patientId.length === 0) {
      throw new DomainValidationError("Order requires a patientId.");
    }

    Order.ensureEnumValue(OrderDeliveryType, input.deliveryType, "deliveryType");

    if (input.items.length === 0) {
      throw new DomainValidationError("Order requires at least one item.");
    }

    const guardianId = Order.normalizeOptionalId(input.guardianId);
    const token = input.token?.trim() ? input.token.trim() : Order.generateToken();
    const orderId = id ?? randomUUID();

    const items = input.items.map((item) =>
      OrderItem.create({
        orderId,
        productId: item.productId,
        unitPrice: MoneyInCents.create(item.unitPriceInCents),
        quantity: item.quantity,
      }),
    );

    return new Order(
      {
        organizationId,
        token,
        patientId,
        guardianId,
        status: OrderStatus.Requested,
        deliveryType: input.deliveryType,
        items,
      },
      orderId,
    );
  }

  static restore(input: RestoreOrderInput, id: string): Order {
    return new Order(
      {
        organizationId: input.organizationId,
        token: input.token,
        patientId: input.patientId,
        guardianId: input.guardianId,
        status: input.status,
        deliveryType: input.deliveryType,
        items: input.items,
      },
      id,
    );
  }

  static generateToken(): string {
    const bytes = randomBytes(TOKEN_BODY_LENGTH);
    let body = "";

    for (let index = 0; index < TOKEN_BODY_LENGTH; index += 1) {
      const byte = bytes[index] ?? 0;
      body += TOKEN_ALPHABET[byte % TOKEN_ALPHABET.length];
    }

    return `${TOKEN_PREFIX}${body}`;
  }

  /** Guards mutations: a cancelled order can no longer change. */
  ensureMutable(): void {
    if (this.props.status === OrderStatus.Cancelled) {
      throw new DomainValidationError("A cancelled order can no longer be changed.");
    }
  }

  cancel(): void {
    this.ensureMutable();
    this.props.status = OrderStatus.Cancelled;
  }

  private static normalizeOptionalId(value: string | null | undefined): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  private static ensureEnumValue<T extends Record<string, string>>(
    enumObject: T,
    value: unknown,
    field: string,
  ): void {
    if (!Object.values(enumObject).includes(value as string)) {
      throw new DomainValidationError(`Invalid order ${field}.`);
    }
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get token(): string {
    return this.props.token;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get guardianId(): string | null {
    return this.props.guardianId;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get deliveryType(): OrderDeliveryType {
    return this.props.deliveryType;
  }

  get items(): OrderItem[] {
    return [...this.props.items];
  }

  get itemsAmount(): number {
    return this.props.items.reduce((total, item) => total + item.quantity, 0);
  }

  get grossAmountInCents(): number {
    return this.props.items.reduce((total, item) => total + item.subtotalInCents, 0);
  }

  get isCancelled(): boolean {
    return this.props.status === OrderStatus.Cancelled;
  }
}

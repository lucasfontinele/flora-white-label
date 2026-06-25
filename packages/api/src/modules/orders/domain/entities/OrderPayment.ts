import { AggregateRoot } from "../../../../shared/domain/entities/AggregateRoot.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { DiscountRate } from "../../../../shared/domain/value-objects/DiscountRate.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { PaymentMethod } from "../enums/PaymentMethod.js";
import { PaymentStatus } from "../enums/PaymentStatus.js";

export interface GatewayReference {
  externalPaymentId: string;
  checkoutUrl?: string | null;
  pixQrCode?: string | null;
  pixQrCodeBase64?: string | null;
  expiresAt?: Date | null;
}

export interface OrderPaymentProps {
  orderId: string;
  organizationId: string;
  totalPaid: MoneyInCents;
  discount: DiscountRate | null;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  externalPaymentId: string | null;
  checkoutUrl: string | null;
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  expiresAt: Date | null;
}

export interface CreateOrderPaymentInput {
  orderId: string;
  organizationId: string;
  totalPaid: MoneyInCents;
  discount?: DiscountRate | null;
  paymentMethod: PaymentMethod;
}

export interface RestoreOrderPaymentInput {
  orderId: string;
  organizationId: string;
  totalPaid: MoneyInCents;
  discount: DiscountRate | null;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  externalPaymentId: string | null;
  checkoutUrl: string | null;
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  expiresAt: Date | null;
}

/**
 * Simple Aggregate Root for one payment attempt of an order. It starts at
 * `PENDING`, holds the charged `totalPaid` (integer cents) and the optional
 * `discount` percentage, and stores only NON-SENSITIVE gateway references
 * (never a secret/token/credential). The AbacatePay specifics live entirely in
 * the infrastructure adapter; this aggregate is framework- and vendor-agnostic.
 */
export class OrderPayment extends AggregateRoot<OrderPaymentProps> {
  private constructor(props: OrderPaymentProps, id?: string) {
    super(props, id);
  }

  static create(input: CreateOrderPaymentInput, id?: string): OrderPayment {
    const orderId = input.orderId.trim();
    if (orderId.length === 0) {
      throw new DomainValidationError("OrderPayment requires an orderId.");
    }

    const organizationId = input.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("OrderPayment requires an organizationId.");
    }

    OrderPayment.ensureEnumValue(PaymentMethod, input.paymentMethod, "paymentMethod");

    return new OrderPayment(
      {
        orderId,
        organizationId,
        totalPaid: input.totalPaid,
        discount: input.discount ?? null,
        paymentMethod: input.paymentMethod,
        status: PaymentStatus.Pending,
        externalPaymentId: null,
        checkoutUrl: null,
        pixQrCode: null,
        pixQrCodeBase64: null,
        expiresAt: null,
      },
      id,
    );
  }

  static restore(input: RestoreOrderPaymentInput, id: string): OrderPayment {
    return new OrderPayment(
      {
        orderId: input.orderId,
        organizationId: input.organizationId,
        totalPaid: input.totalPaid,
        discount: input.discount,
        paymentMethod: input.paymentMethod,
        status: input.status,
        externalPaymentId: input.externalPaymentId,
        checkoutUrl: input.checkoutUrl,
        pixQrCode: input.pixQrCode,
        pixQrCodeBase64: input.pixQrCodeBase64,
        expiresAt: input.expiresAt,
      },
      id,
    );
  }

  /** Stores the non-sensitive references returned by the payment gateway. */
  attachGatewayReference(reference: GatewayReference): void {
    const externalPaymentId = reference.externalPaymentId.trim();
    if (externalPaymentId.length === 0) {
      throw new DomainValidationError("Gateway reference requires an externalPaymentId.");
    }

    this.props.externalPaymentId = externalPaymentId;
    this.props.checkoutUrl = OrderPayment.normalizeOptional(reference.checkoutUrl);
    this.props.pixQrCode = OrderPayment.normalizeOptional(reference.pixQrCode);
    this.props.pixQrCodeBase64 = OrderPayment.normalizeOptional(reference.pixQrCodeBase64);
    this.props.expiresAt = reference.expiresAt ?? null;
  }

  /** Updates the local status from a gateway sync; requires an external id. */
  syncStatus(newStatus: PaymentStatus): void {
    if (!this.props.externalPaymentId) {
      throw new DomainValidationError(
        "Cannot sync a payment without an external gateway reference.",
      );
    }

    OrderPayment.ensureEnumValue(PaymentStatus, newStatus, "status");
    this.props.status = newStatus;
  }

  private static normalizeOptional(value: string | null | undefined): string | null {
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
      throw new DomainValidationError(`Invalid payment ${field}.`);
    }
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get totalPaid(): MoneyInCents {
    return this.props.totalPaid;
  }

  get totalPaidInCents(): number {
    return this.props.totalPaid.value;
  }

  get discount(): DiscountRate | null {
    return this.props.discount;
  }

  get discountValue(): number | null {
    return this.props.discount?.value ?? null;
  }

  get paymentMethod(): PaymentMethod {
    return this.props.paymentMethod;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get externalPaymentId(): string | null {
    return this.props.externalPaymentId;
  }

  get checkoutUrl(): string | null {
    return this.props.checkoutUrl;
  }

  get pixQrCode(): string | null {
    return this.props.pixQrCode;
  }

  get pixQrCodeBase64(): string | null {
    return this.props.pixQrCodeBase64;
  }

  get expiresAt(): Date | null {
    return this.props.expiresAt;
  }
}

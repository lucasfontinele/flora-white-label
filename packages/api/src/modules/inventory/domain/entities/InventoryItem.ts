import { AggregateRoot } from "../../../../shared/domain/entities/AggregateRoot.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { Quantity } from "../../../../shared/domain/value-objects/Quantity.js";
import { InventoryMovementType } from "../enums/InventoryMovementType.js";

export interface InventoryItemProps {
  organizationId: string;
  productId: string;
  availableQuantity: Quantity;
  reservedQuantity: Quantity;
  minimumQuantity: Quantity;
}

export interface CreateInventoryItemInput {
  organizationId: string;
  productId: string;
  availableQuantity?: number;
  minimumQuantity?: number;
  reason?: string | null;
}

export interface RestoreInventoryItemInput {
  organizationId: string;
  productId: string;
  availableQuantity: number;
  reservedQuantity: number;
  minimumQuantity: number;
}

/**
 * Draft of a stock movement buffered by the aggregate during an operation. The
 * application layer enriches it with the acting user and identifiers before
 * persisting an {@link InventoryMovement}.
 */
export interface InventoryMovementDraft {
  type: InventoryMovementType;
  quantity: number;
  reason: string | null;
}

/**
 * Aggregate Root for the stock position of a product in an organization. It
 * owns quantity invariants (nonnegativity, reserve <= available,
 * release/out <= reserved) and guarantees that every successful operation
 * buffers exactly one movement draft. It never mutates the product catalog.
 */
export class InventoryItem extends AggregateRoot<InventoryItemProps> {
  private pendingMovements: InventoryMovementDraft[] = [];

  private constructor(props: InventoryItemProps, id?: string) {
    super(props, id);
  }

  /**
   * Creates a brand-new position. `reservedQuantity` always starts at zero.
   * When the initial `availableQuantity` is greater than zero, an opening `IN`
   * movement draft is buffered.
   */
  static create(input: CreateInventoryItemInput, id?: string): InventoryItem {
    const organizationId = input.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("InventoryItem requires an organizationId.");
    }

    const productId = input.productId.trim();
    if (productId.length === 0) {
      throw new DomainValidationError("InventoryItem requires a productId.");
    }

    const available = input.availableQuantity ?? 0;
    const minimum = input.minimumQuantity ?? 0;

    const item = new InventoryItem(
      {
        organizationId,
        productId,
        availableQuantity: Quantity.create(available),
        reservedQuantity: Quantity.create(0),
        minimumQuantity: Quantity.create(minimum),
      },
      id,
    );

    if (available > 0) {
      item.recordMovement(InventoryMovementType.In, available, input.reason ?? null);
    }

    return item;
  }

  /**
   * Rehydrates an existing position from persistence without buffering any
   * movement draft.
   */
  static restore(input: RestoreInventoryItemInput, id: string): InventoryItem {
    return new InventoryItem(
      {
        organizationId: input.organizationId,
        productId: input.productId,
        availableQuantity: Quantity.create(input.availableQuantity),
        reservedQuantity: Quantity.create(input.reservedQuantity),
        minimumQuantity: Quantity.create(input.minimumQuantity),
      },
      id,
    );
  }

  addStock(quantity: number, reason?: string | null): void {
    const amount = InventoryItem.ensurePositive(quantity);

    this.props.availableQuantity = Quantity.create(this.availableQuantity + amount);
    this.recordMovement(InventoryMovementType.In, amount, reason ?? null);
  }

  reserve(quantity: number, reason?: string | null): void {
    const amount = InventoryItem.ensurePositive(quantity);

    if (amount > this.availableQuantity) {
      throw new DomainValidationError("Cannot reserve more than the available quantity.");
    }

    this.props.availableQuantity = Quantity.create(this.availableQuantity - amount);
    this.props.reservedQuantity = Quantity.create(this.reservedQuantity + amount);
    this.recordMovement(InventoryMovementType.Reserve, amount, reason ?? null);
  }

  releaseReservation(quantity: number, reason?: string | null): void {
    const amount = InventoryItem.ensurePositive(quantity);

    if (amount > this.reservedQuantity) {
      throw new DomainValidationError("Cannot release more than the reserved quantity.");
    }

    this.props.reservedQuantity = Quantity.create(this.reservedQuantity - amount);
    this.props.availableQuantity = Quantity.create(this.availableQuantity + amount);
    this.recordMovement(InventoryMovementType.Release, amount, reason ?? null);
  }

  confirmStockOut(quantity: number, reason?: string | null): void {
    const amount = InventoryItem.ensurePositive(quantity);

    if (amount > this.reservedQuantity) {
      throw new DomainValidationError("Cannot confirm stock-out beyond the reserved quantity.");
    }

    this.props.reservedQuantity = Quantity.create(this.reservedQuantity - amount);
    this.recordMovement(InventoryMovementType.Out, amount, reason ?? null);
  }

  adjustStock(quantity: number, reason?: string | null): void {
    const amount = InventoryItem.ensureNonNegative(quantity);

    this.props.availableQuantity = Quantity.create(amount);
    this.recordMovement(InventoryMovementType.Adjustment, amount, reason ?? null);
  }

  pullMovements(): InventoryMovementDraft[] {
    const movements = [...this.pendingMovements];
    this.pendingMovements = [];

    return movements;
  }

  private recordMovement(
    type: InventoryMovementType,
    quantity: number,
    reason: string | null,
  ): void {
    const trimmed = reason?.trim();
    this.pendingMovements.push({
      type,
      quantity,
      reason: trimmed && trimmed.length > 0 ? trimmed : null,
    });
  }

  private static ensurePositive(quantity: number): number {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainValidationError("Quantity must be a positive integer.");
    }

    return quantity;
  }

  private static ensureNonNegative(quantity: number): number {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new DomainValidationError("Quantity must be a non-negative integer.");
    }

    return quantity;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get availableQuantity(): number {
    return this.props.availableQuantity.value;
  }

  get reservedQuantity(): number {
    return this.props.reservedQuantity.value;
  }

  get minimumQuantity(): number {
    return this.props.minimumQuantity.value;
  }

  get belowMinimum(): boolean {
    return this.availableQuantity < this.minimumQuantity;
  }
}

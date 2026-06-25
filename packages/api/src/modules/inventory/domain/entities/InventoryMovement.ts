import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { Quantity } from "../../../../shared/domain/value-objects/Quantity.js";
import { InventoryMovementType } from "../enums/InventoryMovementType.js";

export interface InventoryMovementProps {
  organizationId: string;
  inventoryItemId: string;
  productId: string;
  type: InventoryMovementType;
  quantity: Quantity;
  reason?: string | null;
  createdByUserId: string;
}

/**
 * Append-only audit record of a single stock operation. It belongs to the
 * {@link InventoryItem} aggregate boundary and is never updated or deleted.
 */
export class InventoryMovement extends Entity<InventoryMovementProps> {
  private constructor(props: InventoryMovementProps, id?: string) {
    super(props, id);
  }

  static create(props: InventoryMovementProps, id?: string): InventoryMovement {
    const organizationId = props.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("InventoryMovement requires an organizationId.");
    }

    const inventoryItemId = props.inventoryItemId.trim();
    if (inventoryItemId.length === 0) {
      throw new DomainValidationError("InventoryMovement requires an inventoryItemId.");
    }

    const productId = props.productId.trim();
    if (productId.length === 0) {
      throw new DomainValidationError("InventoryMovement requires a productId.");
    }

    const createdByUserId = props.createdByUserId.trim();
    if (createdByUserId.length === 0) {
      throw new DomainValidationError("InventoryMovement requires a createdByUserId.");
    }

    if (!Object.values(InventoryMovementType).includes(props.type)) {
      throw new DomainValidationError("Invalid inventory movement type.");
    }

    return new InventoryMovement(
      {
        organizationId,
        inventoryItemId,
        productId,
        type: props.type,
        quantity: props.quantity,
        reason: InventoryMovement.normalizeReason(props.reason),
        createdByUserId,
      },
      id,
    );
  }

  private static normalizeReason(value: string | null | undefined): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get inventoryItemId(): string {
    return this.props.inventoryItemId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get type(): InventoryMovementType {
    return this.props.type;
  }

  get quantity(): number {
    return this.props.quantity.value;
  }

  get reason(): string | null {
    return this.props.reason ?? null;
  }

  get createdByUserId(): string {
    return this.props.createdByUserId;
  }
}

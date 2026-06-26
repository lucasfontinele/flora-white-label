import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { PrescriptionPeriod } from "../enums/PrescriptionPeriod.js";

export interface PrescriptionItemProps {
  prescriptionId: string;
  productId: string;
  allowedQuantity: number;
  period: PrescriptionPeriod;
  notes?: string | null;
}

/**
 * A single posology line of a prescription: how much of a given catalog product
 * the patient is allowed to buy per period (monthly or annual). The allowed
 * quantity is expressed in the product's order unit, so it can be enforced
 * directly against the summed order item quantities.
 */
export class PrescriptionItem extends Entity<PrescriptionItemProps> {
  private constructor(props: PrescriptionItemProps, id?: string) {
    super(props, id);
  }

  static create(props: PrescriptionItemProps, id?: string): PrescriptionItem {
    const prescriptionId = props.prescriptionId.trim();
    if (prescriptionId.length === 0) {
      throw new DomainValidationError("Prescription item requires a prescriptionId.");
    }

    const productId = props.productId.trim();
    if (productId.length === 0) {
      throw new DomainValidationError("Prescription item requires a productId.");
    }

    if (!Number.isInteger(props.allowedQuantity) || props.allowedQuantity < 1) {
      throw new DomainValidationError(
        "Prescription item requires an allowed quantity of at least 1.",
      );
    }

    if (!Object.values(PrescriptionPeriod).includes(props.period)) {
      throw new DomainValidationError("Prescription item requires a valid period.");
    }

    const trimmedNotes = props.notes?.trim();
    const notes = trimmedNotes && trimmedNotes.length > 0 ? trimmedNotes : null;

    return new PrescriptionItem(
      {
        prescriptionId,
        productId,
        allowedQuantity: props.allowedQuantity,
        period: props.period,
        notes,
      },
      id,
    );
  }

  get prescriptionId(): string {
    return this.props.prescriptionId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get allowedQuantity(): number {
    return this.props.allowedQuantity;
  }

  get period(): PrescriptionPeriod {
    return this.props.period;
  }

  get notes(): string | null {
    return this.props.notes ?? null;
  }
}

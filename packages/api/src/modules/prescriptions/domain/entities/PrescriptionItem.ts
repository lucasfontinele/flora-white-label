import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { ProductCategory } from "../../../products/domain/enums/ProductCategory.js";
import { PrescriptionItemScope } from "../enums/PrescriptionItemScope.js";
import { PrescriptionPeriod } from "../enums/PrescriptionPeriod.js";

export interface PrescriptionItemProps {
  prescriptionId: string;
  scope: PrescriptionItemScope;
  productId?: string | null;
  category?: ProductCategory | null;
  allowedQuantity: number;
  period: PrescriptionPeriod;
  notes?: string | null;
}

/**
 * A single posology line of a prescription: how much the patient is allowed to
 * buy per period (monthly or annual). The allowance is scoped either to a
 * specific catalog product (`PRODUCT`) or to a whole product category
 * (`CATEGORY`, summed across every product of that category). The quantity is
 * expressed in the product's order unit, so it can be enforced directly against
 * the summed order item quantities.
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

    if (!Object.values(PrescriptionItemScope).includes(props.scope)) {
      throw new DomainValidationError("Prescription item requires a valid scope.");
    }

    if (!Number.isInteger(props.allowedQuantity) || props.allowedQuantity < 1) {
      throw new DomainValidationError(
        "Prescription item requires an allowed quantity of at least 1.",
      );
    }

    if (!Object.values(PrescriptionPeriod).includes(props.period)) {
      throw new DomainValidationError("Prescription item requires a valid period.");
    }

    let productId: string | null = null;
    let category: ProductCategory | null = null;

    if (props.scope === PrescriptionItemScope.Product) {
      productId = props.productId?.trim() ?? "";
      if (productId.length === 0) {
        throw new DomainValidationError("A product-scoped posology line requires a productId.");
      }
    } else {
      if (!props.category || !Object.values(ProductCategory).includes(props.category)) {
        throw new DomainValidationError("A category-scoped posology line requires a valid category.");
      }
      category = props.category;
    }

    const trimmedNotes = props.notes?.trim();
    const notes = trimmedNotes && trimmedNotes.length > 0 ? trimmedNotes : null;

    return new PrescriptionItem(
      {
        prescriptionId,
        scope: props.scope,
        productId,
        category,
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

  get scope(): PrescriptionItemScope {
    return this.props.scope;
  }

  get productId(): string | null {
    return this.props.productId ?? null;
  }

  get category(): ProductCategory | null {
    return this.props.category ?? null;
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

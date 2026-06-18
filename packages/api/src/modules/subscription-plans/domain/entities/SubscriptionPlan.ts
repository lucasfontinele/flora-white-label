import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";

export interface SubscriptionPlanProps {
  title: string;
  description?: string;
  price: MoneyInCents;
  operatorsLimit: number;
  patientsLimit: number;
}

/**
 * Subscription plan available to organizations. Independent entity (not an
 * aggregate root at this stage). Price is always handled in cents.
 */
export class SubscriptionPlan extends Entity<SubscriptionPlanProps> {
  private constructor(props: SubscriptionPlanProps, id?: string) {
    super(props, id);
  }

  static create(props: SubscriptionPlanProps, id?: string): SubscriptionPlan {
    const title = props.title.trim();
    if (title.length === 0) {
      throw new DomainValidationError("Subscription plan title is required.");
    }

    const description = props.description?.trim();
    if (description && description.length === 0) {
      throw new DomainValidationError("Subscription plan description is required.");
    }

    if (!Number.isInteger(props.operatorsLimit) || props.operatorsLimit <= 0) {
      throw new DomainValidationError("operatorsLimit must be a positive integer.");
    }

    if (!Number.isInteger(props.patientsLimit) || props.patientsLimit <= 0) {
      throw new DomainValidationError("patientsLimit must be a positive integer.");
    }

    return new SubscriptionPlan({ ...props, title, description }, id);
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description ?? '';
  }

  get price(): MoneyInCents {
    return this.props.price;
  }

  get priceInCents(): number {
    return this.props.price.value;
  }

  get operatorsLimit(): number {
    return this.props.operatorsLimit;
  }

  get patientsLimit(): number {
    return this.props.patientsLimit;
  }
}

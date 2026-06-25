import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";

export interface SubscriptionPlanProps {
  title: string;
  description?: string;
  price: MoneyInCents;
  operatorsLimit: number;
  patientsLimit: number;
  unlimitedOperators?: boolean;
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

    let description: string | undefined;
    if (props.description !== undefined) {
      description = props.description.trim();

      if (description.length === 0) {
        throw new DomainValidationError("Subscription plan description is required.");
      }
    }

    const unlimitedOperators = props.unlimitedOperators ?? false;
    // When operators are unlimited the operatorsLimit is irrelevant, so it is
    // ignored and normalized to 0; otherwise it must be a positive integer.
    const operatorsLimit = unlimitedOperators ? 0 : props.operatorsLimit;
    if (!unlimitedOperators && (!Number.isInteger(operatorsLimit) || operatorsLimit <= 0)) {
      throw new DomainValidationError("operatorsLimit must be a positive integer.");
    }

    if (!Number.isInteger(props.patientsLimit) || props.patientsLimit <= 0) {
      throw new DomainValidationError("patientsLimit must be a positive integer.");
    }

    return new SubscriptionPlan(
      { ...props, title, description, operatorsLimit, unlimitedOperators },
      id,
    );
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
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

  get unlimitedOperators(): boolean {
    return this.props.unlimitedOperators ?? false;
  }
}

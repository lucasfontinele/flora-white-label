import { AggregateRoot } from "../../../../shared/domain/entities/AggregateRoot.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { isValidSlug } from "../slug.js";
import type { Cnpj } from "../value-objects/Cnpj.js";
import type { Cnae } from "../value-objects/Cnae.js";

export interface OrganizationProps {
  slug: string;
  tradeName: string;
  legalName: string;
  cnpj: Cnpj;
  primaryCnae: Cnae;
  secondaryCnaes: Cnae[];
  currentPlanId: string;
  addressId: string;
}

/**
 * Organization (association) aggregate root. It guards the initial registration
 * invariants only. Patients, users and operators are NOT part of the aggregate;
 * they will link to it later via `organizationId`. OrganizationSettings is also
 * intentionally kept outside the aggregate.
 */
export class Organization extends AggregateRoot<OrganizationProps> {
  private constructor(props: OrganizationProps, id?: string) {
    super(props, id);
  }

  static create(props: OrganizationProps, id?: string): Organization {
    const tradeName = props.tradeName.trim();
    if (tradeName.length === 0) {
      throw new DomainValidationError("Organization tradeName is required.");
    }

    const legalName = props.legalName.trim();
    if (legalName.length === 0) {
      throw new DomainValidationError("Organization legalName is required.");
    }

    if (props.currentPlanId.trim().length === 0) {
      throw new DomainValidationError("Organization requires a currentPlanId.");
    }

    if (props.addressId.trim().length === 0) {
      throw new DomainValidationError("Organization requires an addressId.");
    }

    const slug = props.slug.trim();
    if (!isValidSlug(slug)) {
      throw new DomainValidationError(`Invalid organization slug: "${props.slug}".`);
    }

    return new Organization({ ...props, slug, tradeName, legalName }, id);
  }

  get slug(): string {
    return this.props.slug;
  }

  get tradeName(): string {
    return this.props.tradeName;
  }

  get legalName(): string {
    return this.props.legalName;
  }

  get cnpj(): Cnpj {
    return this.props.cnpj;
  }

  get primaryCnae(): Cnae {
    return this.props.primaryCnae;
  }

  get secondaryCnaes(): readonly Cnae[] {
    return this.props.secondaryCnaes;
  }

  get currentPlanId(): string {
    return this.props.currentPlanId;
  }

  get addressId(): string {
    return this.props.addressId;
  }
}

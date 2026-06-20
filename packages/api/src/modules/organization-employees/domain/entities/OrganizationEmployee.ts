import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";

export interface OrganizationEmployeeProps {
  organizationId: string;
  fullName: string;
  document: Document;
  isActive: boolean;
}

/**
 * A person who works for an organization and will later access the
 * association's control panel. Auth data lives on the `User`, which owns the
 * link to this entity (`User.organizationEmployeeId`); this entity holds the
 * employee's organization-scoped personal data (name, CPF) and active status.
 */
export class OrganizationEmployee extends Entity<OrganizationEmployeeProps> {
  private constructor(props: OrganizationEmployeeProps, id?: string) {
    super(props, id);
  }

  static create(props: OrganizationEmployeeProps, id?: string): OrganizationEmployee {
    if (props.organizationId.trim().length === 0) {
      throw new DomainValidationError("Organization employee requires an organizationId.");
    }

    const fullName = props.fullName.trim();
    if (fullName.length === 0) {
      throw new DomainValidationError("Organization employee fullName is required.");
    }

    return new OrganizationEmployee({ ...props, fullName }, id);
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get document(): Document {
    return this.props.document;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  activate(): void {
    this.props.isActive = true;
  }

  deactivate(): void {
    this.props.isActive = false;
  }
}

import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

export interface OrganizationRequiredDocumentProps {
  organizationId: string;
  name: string;
  observations?: string | null;
}

export class OrganizationRequiredDocument extends Entity<OrganizationRequiredDocumentProps> {
  private constructor(props: OrganizationRequiredDocumentProps, id?: string) {
    super(props, id);
  }

  static create(
    props: OrganizationRequiredDocumentProps,
    id?: string,
  ): OrganizationRequiredDocument {
    const organizationId = props.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("Required document requires an organizationId.");
    }

    const name = props.name.trim();
    if (name.length === 0) {
      throw new DomainValidationError("Required document name is required.");
    }

    // Optional free-text instruction for this document type. Blank/whitespace is
    // treated as "no observation" so the column stays null instead of empty.
    const trimmedObservations = props.observations?.trim();
    const observations =
      trimmedObservations && trimmedObservations.length > 0 ? trimmedObservations : null;

    return new OrganizationRequiredDocument({ organizationId, name, observations }, id);
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get observations(): string | null {
    return this.props.observations ?? null;
  }
}

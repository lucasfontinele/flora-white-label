import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import type { Gender } from "../../../../shared/domain/enums/Gender.js";

export interface GuardianProps {
  organizationId: string;
  name: string;
  document: Document;
  birthdate: Date;
  gender: Gender;
}

/**
 * Responsible party or pet tutor associated with an organization. Human
 * patients may exist without one when they are registered as their own user.
 */
export class Guardian extends Entity<GuardianProps> {
  private constructor(props: GuardianProps, id?: string) {
    super(props, id);
  }

  static create(props: GuardianProps, id?: string): Guardian {
    if (props.organizationId.trim().length === 0) {
      throw new DomainValidationError("Guardian requires an organizationId.");
    }

    const name = props.name.trim();
    if (name.length === 0) {
      throw new DomainValidationError("Guardian name is required.");
    }

    if (!(props.birthdate instanceof Date) || Number.isNaN(props.birthdate.getTime())) {
      throw new DomainValidationError("Guardian birthdate is required and must be a valid date.");
    }

    return new Guardian({ ...props, name }, id);
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get document(): Document {
    return this.props.document;
  }

  get birthdate(): Date {
    return this.props.birthdate;
  }

  get gender(): Gender {
    return this.props.gender;
  }
}

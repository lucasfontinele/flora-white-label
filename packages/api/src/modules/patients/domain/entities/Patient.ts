import { AggregateRoot } from "../../../../shared/domain/entities/AggregateRoot.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import type { Gender } from "../../../../shared/domain/enums/Gender.js";

export interface PatientProps {
  organizationId: string;
  guardianId: string;
  name: string;
  document: Document;
  birthdate: Date;
  gender: Gender;
  underPrivileged: boolean;
}

/**
 * Patient aggregate root — the central actor of the registration form. Always
 * bound to a Guardian via `guardianId`. The `underPrivileged` flag (inability
 * to afford the future annual fee) belongs to the patient, never the guardian.
 */
export class Patient extends AggregateRoot<PatientProps> {
  private constructor(props: PatientProps, id?: string) {
    super(props, id);
  }

  static create(props: PatientProps, id?: string): Patient {
    if (props.organizationId.trim().length === 0) {
      throw new DomainValidationError("Patient requires an organizationId.");
    }

    if (props.guardianId.trim().length === 0) {
      throw new DomainValidationError("Patient must have a guardianId.");
    }

    const name = props.name.trim();
    if (name.length === 0) {
      throw new DomainValidationError("Patient name is required.");
    }

    if (!(props.birthdate instanceof Date) || Number.isNaN(props.birthdate.getTime())) {
      throw new DomainValidationError("Patient birthdate is required and must be a valid date.");
    }

    return new Patient({ ...props, name }, id);
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get guardianId(): string {
    return this.props.guardianId;
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

  get underPrivileged(): boolean {
    return this.props.underPrivileged;
  }
}

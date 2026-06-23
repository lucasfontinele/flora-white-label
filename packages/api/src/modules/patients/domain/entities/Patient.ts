import { AggregateRoot } from "../../../../shared/domain/entities/AggregateRoot.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import type { Gender } from "../../../../shared/domain/enums/Gender.js";
import { PatientStatus } from "../enums/PatientStatus.js";

export interface PatientProps {
  organizationId: string;
  guardianId?: string;
  name: string;
  document: Document;
  birthdate: Date;
  gender: Gender;
  underPrivileged: boolean;
  patientStatus?: PatientStatus;
  rejectionReason?: string | null;
}

/**
 * Patient aggregate root — the central actor of the registration form. It may
 * be bound to a legal guardian, but self-responsible patients do not require
 * one. The `underPrivileged` flag belongs to the patient, never the guardian.
 */
export class Patient extends AggregateRoot<PatientProps> {
  private constructor(props: PatientProps, id?: string) {
    super(props, id);
  }

  static create(props: PatientProps, id?: string): Patient {
    const organizationId = props.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("Patient requires an organizationId.");
    }

    const guardianId = props.guardianId?.trim();
    if (props.guardianId !== undefined && guardianId?.length === 0) {
      throw new DomainValidationError("Patient guardianId cannot be empty.");
    }

    const name = props.name.trim();
    if (name.length === 0) {
      throw new DomainValidationError("Patient name is required.");
    }

    if (!(props.birthdate instanceof Date) || Number.isNaN(props.birthdate.getTime())) {
      throw new DomainValidationError("Patient birthdate is required and must be a valid date.");
    }

    const patientStatus = props.patientStatus ?? PatientStatus.WaitingDocuments;
    const rejectionReason = props.rejectionReason?.trim() ? props.rejectionReason.trim() : null;
    if (patientStatus !== PatientStatus.Rejected && rejectionReason !== null) {
      throw new DomainValidationError("rejectionReason must be null unless the registration is rejected.");
    }
    if (patientStatus === PatientStatus.Rejected && rejectionReason === null) {
      throw new DomainValidationError("rejectionReason is required for a rejected registration.");
    }

    return new Patient(
      { ...props, organizationId, guardianId, name, patientStatus, rejectionReason },
      id,
    );
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get guardianId(): string | undefined {
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

  get patientStatus(): PatientStatus {
    return this.props.patientStatus ?? PatientStatus.WaitingDocuments;
  }

  get rejectionReason(): string | null {
    return this.props.rejectionReason ?? null;
  }

  /** Moves a fully-documented patient into the organization's review queue. */
  submitForApproval(): void {
    if (this.props.patientStatus === PatientStatus.WaitingDocuments) {
      this.props.patientStatus = PatientStatus.WaitingApproval;
    }
  }

  approveRegistration(): void {
    this.props.patientStatus = PatientStatus.Approval;
    this.props.rejectionReason = null;
  }

  rejectRegistration(reason: string): void {
    const trimmed = reason.trim();
    if (trimmed.length === 0) {
      throw new DomainValidationError("rejectionReason is required when rejecting a registration.");
    }

    this.props.patientStatus = PatientStatus.Rejected;
    this.props.rejectionReason = trimmed;
  }
}

import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

export interface PatientPrescriptionProps {
  organizationId: string;
  patientId: string;
  issuedAt: Date;
  validUntil: Date;
  observations?: string | null;
}

export class PatientPrescription extends Entity<PatientPrescriptionProps> {
  private constructor(props: PatientPrescriptionProps, id?: string) {
    super(props, id);
  }

  static create(props: PatientPrescriptionProps, id?: string): PatientPrescription {
    const organizationId = props.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("Prescription requires an organizationId.");
    }

    const patientId = props.patientId.trim();
    if (patientId.length === 0) {
      throw new DomainValidationError("Prescription requires a patientId.");
    }

    if (!(props.issuedAt instanceof Date) || Number.isNaN(props.issuedAt.getTime())) {
      throw new DomainValidationError("Prescription requires a valid issuedAt date.");
    }

    if (!(props.validUntil instanceof Date) || Number.isNaN(props.validUntil.getTime())) {
      throw new DomainValidationError("Prescription requires a valid validUntil date.");
    }

    // Optional free-text note (e.g. prescriber, source). Blank/whitespace is
    // treated as "no observation" so the column stays null instead of empty.
    const trimmedObservations = props.observations?.trim();
    const observations =
      trimmedObservations && trimmedObservations.length > 0 ? trimmedObservations : null;

    return new PatientPrescription(
      {
        organizationId,
        patientId,
        issuedAt: props.issuedAt,
        validUntil: props.validUntil,
        observations,
      },
      id,
    );
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get issuedAt(): Date {
    return this.props.issuedAt;
  }

  get validUntil(): Date {
    return this.props.validUntil;
  }

  /**
   * Whether the receita is still valid at the given moment (defaults to now).
   */
  isValidAt(reference: Date = new Date()): boolean {
    return this.props.validUntil.getTime() > reference.getTime();
  }

  get observations(): string | null {
    return this.props.observations ?? null;
  }
}

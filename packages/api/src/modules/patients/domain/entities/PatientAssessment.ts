import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

export interface PatientAssessmentProps {
  patientId: string;
  guardianId: string;
  isApproved: boolean;
  approvedAt: Date | null;
}

/**
 * Assessment of a patient's under-privileged (hardship) condition. Only the
 * minimal entity and its core invariant are modeled here — the full approval
 * flow is out of scope for this slice.
 */
export class PatientAssessment extends Entity<PatientAssessmentProps> {
  private constructor(props: PatientAssessmentProps, id?: string) {
    super(props, id);
  }

  static create(props: PatientAssessmentProps, id?: string): PatientAssessment {
    if (props.patientId.trim().length === 0) {
      throw new DomainValidationError("PatientAssessment requires a patientId.");
    }

    if (props.guardianId.trim().length === 0) {
      throw new DomainValidationError("PatientAssessment requires a guardianId.");
    }

    if (props.isApproved && props.approvedAt === null) {
      throw new DomainValidationError("approvedAt is required when the assessment is approved.");
    }

    if (!props.isApproved && props.approvedAt !== null) {
      throw new DomainValidationError("approvedAt must be null when the assessment is not approved.");
    }

    return new PatientAssessment(props, id);
  }

  /** Convenience factory for the initial, not-yet-approved assessment. */
  static createPending(params: { patientId: string; guardianId: string }): PatientAssessment {
    return PatientAssessment.create({
      patientId: params.patientId,
      guardianId: params.guardianId,
      isApproved: false,
      approvedAt: null,
    });
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get guardianId(): string {
    return this.props.guardianId;
  }

  get isApproved(): boolean {
    return this.props.isApproved;
  }

  get approvedAt(): Date | null {
    return this.props.approvedAt;
  }
}

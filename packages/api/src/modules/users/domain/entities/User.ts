import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { Email } from "../value-objects/Email.js";
import type { PasswordHash } from "../value-objects/PasswordHash.js";
import { UserProfile } from "../enums/UserProfile.js";

export interface UserProps {
  organizationId: string;
  email: Email;
  passwordHash: PasswordHash;
  profile: UserProfile;
  guardianId?: string;
  patientId?: string;
  organizationEmployeeId?: string;
}

/**
 * Systemic user — authentication/authorization data only. It must never hold
 * personal data (name, document, birthdate, gender); that lives on Guardian
 * and Patient.
 */
export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  static create(props: UserProps, id?: string): User {
    const normalizedProps = User.normalizeProps(props);
    User.validate(normalizedProps);

    return new User(normalizedProps, id);
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): PasswordHash {
    return this.props.passwordHash;
  }

  get profile(): UserProfile {
    return this.props.profile;
  }

  get guardianId(): string | undefined {
    return this.props.guardianId;
  }

  get patientId(): string | undefined {
    return this.props.patientId;
  }

  get organizationEmployeeId(): string | undefined {
    return this.props.organizationEmployeeId;
  }

  linkOrganizationEmployee(organizationEmployeeId: string): void {
    const normalizedId = User.normalizeId(organizationEmployeeId, "organizationEmployeeId");
    const nextProps = { ...this.props, organizationEmployeeId: normalizedId };
    User.validate(nextProps);

    this.props.organizationEmployeeId = normalizedId;
  }

  linkGuardian(guardianId: string): void {
    const normalizedGuardianId = User.normalizeId(guardianId, "guardianId");
    const nextProps = { ...this.props, guardianId: normalizedGuardianId };
    User.validate(nextProps);

    this.props.guardianId = normalizedGuardianId;
  }

  linkPatient(patientId: string): void {
    const normalizedPatientId = User.normalizeId(patientId, "patientId");
    const nextProps = { ...this.props, patientId: normalizedPatientId };
    User.validate(nextProps);

    this.props.patientId = normalizedPatientId;
  }

  becomePatient(patientId: string): void {
    const normalizedPatientId = User.normalizeId(patientId, "patientId");
    const nextProps = {
      ...this.props,
      profile: UserProfile.Patient,
      patientId: normalizedPatientId,
    };
    User.validate(nextProps);

    this.props.profile = UserProfile.Patient;
    this.props.patientId = normalizedPatientId;
  }

  private static normalizeProps(props: UserProps): UserProps {
    return {
      ...props,
      organizationId: props.organizationId.trim(),
      guardianId:
        props.guardianId === undefined ? undefined : User.normalizeId(props.guardianId, "guardianId"),
      patientId:
        props.patientId === undefined ? undefined : User.normalizeId(props.patientId, "patientId"),
      organizationEmployeeId:
        props.organizationEmployeeId === undefined
          ? undefined
          : User.normalizeId(props.organizationEmployeeId, "organizationEmployeeId"),
    };
  }

  private static normalizeId(
    value: string,
    fieldName: "guardianId" | "patientId" | "organizationEmployeeId",
  ): string {
    const normalized = value.trim();

    if (normalized.length === 0) {
      throw new DomainValidationError(`User ${fieldName} cannot be empty.`);
    }

    return normalized;
  }

  private static validate(props: UserProps): void {
    if (props.organizationId.length === 0) {
      throw new DomainValidationError("User requires an organizationId.");
    }

    if (props.profile === UserProfile.Guardian && !props.guardianId) {
      throw new DomainValidationError("Guardian users must be linked to a guardian.");
    }

    if (props.profile === UserProfile.Patient && !props.patientId) {
      throw new DomainValidationError("Patient users must be linked to a patient.");
    }

    if (props.patientId && props.profile !== UserProfile.Patient) {
      throw new DomainValidationError("Only Patient users can be linked to a patient.");
    }

    if (props.organizationEmployeeId && props.profile !== UserProfile.Organization) {
      throw new DomainValidationError("Only Organization users can be linked to an employee.");
    }
  }
}

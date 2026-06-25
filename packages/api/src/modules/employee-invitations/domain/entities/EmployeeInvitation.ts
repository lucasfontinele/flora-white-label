import { randomBytes } from "node:crypto";
import { AggregateRoot } from "../../../../shared/domain/entities/AggregateRoot.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { InvitationStatus } from "../enums/InvitationStatus.js";

export interface EmployeeInvitationProps {
  organizationId: string;
  email: string;
  roleId: string;
  token: string;
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  invitedByUserId: string | null;
}

export interface CreateEmployeeInvitationInput {
  organizationId: string;
  email: string;
  roleId: string;
  invitedByUserId?: string | null;
  ttlHours?: number;
}

export interface RestoreEmployeeInvitationInput {
  organizationId: string;
  email: string;
  roleId: string;
  token: string;
  status: InvitationStatus;
  expiresAt: Date;
  acceptedAt: Date | null;
  invitedByUserId: string | null;
}

const DEFAULT_TTL_HOURS = 72;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Aggregate Root for an organization's invitation to onboard an employee with a
 * given access role. It owns the readable lifecycle (pending -> accepted /
 * expired / revoked), generates the URL-safe token used by the registration
 * link, and never leaks how the resulting user/employee are created (that is the
 * application's job). Framework-agnostic.
 */
export class EmployeeInvitation extends AggregateRoot<EmployeeInvitationProps> {
  private constructor(props: EmployeeInvitationProps, id?: string) {
    super(props, id);
  }

  static create(input: CreateEmployeeInvitationInput, id?: string): EmployeeInvitation {
    const organizationId = input.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("EmployeeInvitation requires an organizationId.");
    }

    const roleId = input.roleId.trim();
    if (roleId.length === 0) {
      throw new DomainValidationError("EmployeeInvitation requires a roleId.");
    }

    const email = EmployeeInvitation.normalizeEmail(input.email);
    const ttlHours = input.ttlHours ?? DEFAULT_TTL_HOURS;

    return new EmployeeInvitation(
      {
        organizationId,
        email,
        roleId,
        token: EmployeeInvitation.generateToken(),
        status: InvitationStatus.Pending,
        expiresAt: EmployeeInvitation.expiryFromNow(ttlHours),
        acceptedAt: null,
        invitedByUserId: input.invitedByUserId?.trim() ? input.invitedByUserId.trim() : null,
      },
      id,
    );
  }

  static restore(input: RestoreEmployeeInvitationInput, id: string): EmployeeInvitation {
    return new EmployeeInvitation(
      {
        organizationId: input.organizationId,
        email: input.email,
        roleId: input.roleId,
        token: input.token,
        status: input.status,
        expiresAt: input.expiresAt,
        acceptedAt: input.acceptedAt,
        invitedByUserId: input.invitedByUserId,
      },
      id,
    );
  }

  static generateToken(): string {
    return randomBytes(32).toString("base64url");
  }

  /** Re-issues the invitation: new token, refreshed expiry, back to pending. */
  resend(ttlHours = DEFAULT_TTL_HOURS): void {
    if (this.props.status === InvitationStatus.Accepted) {
      throw new DomainValidationError("An accepted invitation cannot be resent.");
    }

    this.props.token = EmployeeInvitation.generateToken();
    this.props.expiresAt = EmployeeInvitation.expiryFromNow(ttlHours);
    this.props.status = InvitationStatus.Pending;
    this.props.acceptedAt = null;
  }

  /** Marks the invitation accepted. Must be pending and not expired. */
  accept(now: Date = new Date()): void {
    if (this.props.status === InvitationStatus.Accepted) {
      throw new DomainValidationError("This invitation was already accepted.");
    }

    if (this.props.status === InvitationStatus.Revoked) {
      throw new DomainValidationError("This invitation was revoked.");
    }

    if (this.isExpired(now)) {
      throw new DomainValidationError("This invitation has expired.");
    }

    this.props.status = InvitationStatus.Accepted;
    this.props.acceptedAt = now;
  }

  revoke(): void {
    if (this.props.status === InvitationStatus.Accepted) {
      throw new DomainValidationError("An accepted invitation cannot be revoked.");
    }

    this.props.status = InvitationStatus.Revoked;
  }

  isExpired(now: Date = new Date()): boolean {
    return this.props.expiresAt.getTime() <= now.getTime();
  }

  /** True when the invitation can still be accepted right now. */
  isAcceptable(now: Date = new Date()): boolean {
    return this.props.status === InvitationStatus.Pending && !this.isExpired(now);
  }

  private static normalizeEmail(value: string): string {
    const email = (value ?? "").trim().toLowerCase();
    if (email.length === 0) {
      throw new DomainValidationError("EmployeeInvitation requires an email.");
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new DomainValidationError(`Invalid invitation email: "${value}".`);
    }

    return email;
  }

  private static expiryFromNow(ttlHours: number): Date {
    return new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get email(): string {
    return this.props.email;
  }

  get roleId(): string {
    return this.props.roleId;
  }

  get token(): string {
    return this.props.token;
  }

  get status(): InvitationStatus {
    return this.props.status;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get acceptedAt(): Date | null {
    return this.props.acceptedAt;
  }

  get invitedByUserId(): string | null {
    return this.props.invitedByUserId;
  }
}

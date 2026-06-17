import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { Email } from "../value-objects/Email.js";
import type { PasswordHash } from "../value-objects/PasswordHash.js";
import type { UserProfile } from "../enums/UserProfile.js";

export interface UserProps {
  organizationId: string;
  email: Email;
  passwordHash: PasswordHash;
  profile: UserProfile;
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
    if (props.organizationId.trim().length === 0) {
      throw new DomainValidationError("User requires an organizationId.");
    }

    return new User(props, id);
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
}

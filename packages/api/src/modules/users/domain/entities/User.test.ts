import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { User, type UserProps } from "./User.js";
import { UserProfile } from "../enums/UserProfile.js";
import { Email } from "../value-objects/Email.js";
import { PasswordHash } from "../value-objects/PasswordHash.js";

function makeUser(overrides: Partial<UserProps> = {}): User {
  return User.create({
    organizationId: "org-1",
    email: Email.create("user@example.com"),
    passwordHash: PasswordHash.fromHash("hashed:secret"),
    profile: UserProfile.Master,
    ...overrides,
  });
}

describe("User", () => {
  it("fails when a Guardian user has no guardianId", () => {
    expect(() => makeUser({ profile: UserProfile.Guardian })).toThrow(DomainValidationError);
  });

  it("allows a Patient user without guardianId", () => {
    const user = makeUser({ profile: UserProfile.Patient, patientId: "patient-1" });

    expect(user.profile).toBe(UserProfile.Patient);
    expect(user.guardianId).toBeUndefined();
    expect(user.patientId).toBe("patient-1");
  });

  it("fails when a Patient user has no patientId", () => {
    expect(() => makeUser({ profile: UserProfile.Patient, guardianId: "guardian-1" })).toThrow(
      DomainValidationError,
    );
  });

  it("does not allow patientId for non-patient users", () => {
    expect(() =>
      makeUser({
        profile: UserProfile.Guardian,
        guardianId: "guardian-1",
        patientId: "patient-1",
      }),
    ).toThrow(DomainValidationError);
  });

  it("allows Organization users with only organization scope", () => {
    const user = makeUser({ profile: UserProfile.Organization });

    expect(user.profile).toBe(UserProfile.Organization);
    expect(user.organizationId).toBe("org-1");
    expect(user.guardianId).toBeUndefined();
    expect(user.patientId).toBeUndefined();
  });

  it("becomes a patient without requiring a guardianId", () => {
    const user = makeUser();

    user.becomePatient("patient-1");

    expect(user.profile).toBe(UserProfile.Patient);
    expect(user.guardianId).toBeUndefined();
    expect(user.patientId).toBe("patient-1");
  });

  it("links a guardian user as patient and updates the profile", () => {
    const user = makeUser({ profile: UserProfile.Guardian, guardianId: "guardian-1" });

    user.becomePatient("patient-1");

    expect(user.profile).toBe(UserProfile.Patient);
    expect(user.guardianId).toBe("guardian-1");
    expect(user.patientId).toBe("patient-1");
  });
});

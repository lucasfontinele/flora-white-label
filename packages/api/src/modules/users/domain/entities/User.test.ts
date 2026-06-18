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

  it("fails when a Patient user has no guardianId", () => {
    expect(() => makeUser({ profile: UserProfile.Patient, patientId: "patient-1" })).toThrow(
      DomainValidationError,
    );
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

  it("requires a guardianId before becoming a patient", () => {
    const user = makeUser();

    expect(() => user.becomePatient("patient-1")).toThrow(DomainValidationError);
  });

  it("links a guardian user as patient and updates the profile", () => {
    const user = makeUser({ profile: UserProfile.Guardian, guardianId: "guardian-1" });

    user.becomePatient("patient-1");

    expect(user.profile).toBe(UserProfile.Patient);
    expect(user.guardianId).toBe("guardian-1");
    expect(user.patientId).toBe("patient-1");
  });
});

import { describe, expect, it } from "vitest";
import { Patient } from "./Patient.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import { Gender } from "../../../../shared/domain/enums/Gender.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

const document = Document.create("11144477735");

const baseProps = {
  organizationId: "org-1",
  name: "John Doe",
  document,
  birthdate: new Date("2000-01-01"),
  gender: Gender.Male,
  underPrivileged: false,
};

describe("Patient", () => {
  it("cannot be created with an empty guardianId", () => {
    expect(() => Patient.create({ ...baseProps, guardianId: "" })).toThrow(DomainValidationError);
  });

  it("creates a valid patient without a guardian", () => {
    const patient = Patient.create({ ...baseProps, underPrivileged: false });

    expect(patient.guardianId).toBeUndefined();
    expect(patient.document.value).toBe("11144477735");
  });

  it("creates a valid patient bound to a guardian", () => {
    const patient = Patient.create({ ...baseProps, guardianId: "guardian-1", underPrivileged: true });

    expect(patient.guardianId).toBe("guardian-1");
    expect(patient.underPrivileged).toBe(true);
    expect(patient.document.value).toBe("11144477735");
  });
});

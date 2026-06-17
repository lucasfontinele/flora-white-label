import { describe, expect, it } from "vitest";
import { PatientAssessment } from "./PatientAssessment.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";

describe("PatientAssessment", () => {
  it("requires approvedAt when isApproved is true", () => {
    expect(() =>
      PatientAssessment.create({
        patientId: "patient-1",
        guardianId: "guardian-1",
        isApproved: true,
        approvedAt: null,
      }),
    ).toThrow(DomainValidationError);
  });

  it("forbids approvedAt when isApproved is false", () => {
    expect(() =>
      PatientAssessment.create({
        patientId: "patient-1",
        guardianId: "guardian-1",
        isApproved: false,
        approvedAt: new Date(),
      }),
    ).toThrow(DomainValidationError);
  });

  it("creates a pending assessment (not approved, no approvedAt)", () => {
    const assessment = PatientAssessment.createPending({
      patientId: "patient-1",
      guardianId: "guardian-1",
    });

    expect(assessment.isApproved).toBe(false);
    expect(assessment.approvedAt).toBeNull();
  });

  it("creates an approved assessment when approvedAt is provided", () => {
    const approvedAt = new Date();
    const assessment = PatientAssessment.create({
      patientId: "patient-1",
      guardianId: "guardian-1",
      isApproved: true,
      approvedAt,
    });

    expect(assessment.isApproved).toBe(true);
    expect(assessment.approvedAt).toBe(approvedAt);
  });
});

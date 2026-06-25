import { describe, expect, it } from "vitest";
import {
  patientPrescriptionParamsSchema,
  prescriptionListParamsSchema,
  upsertPrescriptionBodySchema,
} from "./prescription-schemas.js";

describe("prescription schemas", () => {
  it("accepts list and patient params", () => {
    expect(prescriptionListParamsSchema.safeParse({ organizationId: "org-1" }).success).toBe(true);
    expect(
      patientPrescriptionParamsSchema.safeParse({ organizationId: "org-1", patientId: "pat-1" })
        .success,
    ).toBe(true);
  });

  it("coerces validUntil from a date-only string and trims observations", () => {
    const result = upsertPrescriptionBodySchema.safeParse({
      validUntil: "2026-12-31",
      observations: "  Receita MEMED  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.validUntil).toBeInstanceOf(Date);
      expect(result.data.validUntil.toISOString().startsWith("2026-12-31")).toBe(true);
      expect(result.data.observations).toBe("Receita MEMED");
    }
  });

  it("accepts a full ISO date-time and null/absent observations", () => {
    expect(
      upsertPrescriptionBodySchema.safeParse({
        validUntil: "2026-12-31T23:59:00.000Z",
        observations: null,
      }).success,
    ).toBe(true);
    expect(upsertPrescriptionBodySchema.safeParse({ validUntil: "2026-12-31" }).success).toBe(true);
  });

  it("rejects an invalid date, missing validUntil, and extra fields", () => {
    expect(upsertPrescriptionBodySchema.safeParse({ validUntil: "not-a-date" }).success).toBe(false);
    expect(upsertPrescriptionBodySchema.safeParse({ observations: "x" }).success).toBe(false);
    expect(
      upsertPrescriptionBodySchema.safeParse({ validUntil: "2026-12-31", extra: 1 }).success,
    ).toBe(false);
  });
});

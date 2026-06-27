import { describe, expect, it } from "vitest";
import { prescriberBodySchema, prescriberItemParamsSchema } from "./prescriber-schemas.js";

describe("prescriberBodySchema", () => {
  it("accepts a valid body and uppercases the UF", () => {
    const result = prescriberBodySchema.safeParse({
      fullName: "Dra. Helena Costa",
      crm: "123456",
      crmState: "sp",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.crmState).toBe("SP");
    }
  });

  it("rejects an invalid UF", () => {
    const result = prescriberBodySchema.safeParse({
      fullName: "Dr. X",
      crm: "1",
      crmState: "XX",
    });

    expect(result.success).toBe(false);
  });

  it("rejects blank required fields", () => {
    expect(
      prescriberBodySchema.safeParse({ fullName: "  ", crm: "1", crmState: "SP" }).success,
    ).toBe(false);
    expect(
      prescriberBodySchema.safeParse({ fullName: "Dr.", crm: "", crmState: "SP" }).success,
    ).toBe(false);
  });

  it("rejects unknown properties (strict)", () => {
    const result = prescriberBodySchema.safeParse({
      fullName: "Dr. X",
      crm: "1",
      crmState: "SP",
      specialty: "cardiology",
    });

    expect(result.success).toBe(false);
  });
});

describe("prescriberItemParamsSchema", () => {
  it("requires organizationId, patientId and prescriberId", () => {
    expect(
      prescriberItemParamsSchema.safeParse({
        organizationId: "org-1",
        patientId: "patient-1",
        prescriberId: "presc-1",
      }).success,
    ).toBe(true);

    expect(
      prescriberItemParamsSchema.safeParse({ organizationId: "org-1", patientId: "patient-1" })
        .success,
    ).toBe(false);
  });
});

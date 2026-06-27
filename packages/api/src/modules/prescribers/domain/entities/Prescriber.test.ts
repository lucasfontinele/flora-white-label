import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { Prescriber } from "./Prescriber.js";

const validProps = {
  organizationId: "org-1",
  patientId: "patient-1",
  fullName: "Dra. Helena Costa",
  crm: "123456",
  crmState: "sp",
};

describe("Prescriber", () => {
  it("creates a prescriber and normalizes the UF to uppercase", () => {
    const prescriber = Prescriber.create(validProps);

    expect(prescriber.id).toBeTruthy();
    expect(prescriber.fullName).toBe("Dra. Helena Costa");
    expect(prescriber.crm).toBe("123456");
    expect(prescriber.crmState).toBe("SP");
  });

  it("trims surrounding whitespace on name and CRM", () => {
    const prescriber = Prescriber.create({ ...validProps, fullName: "  Dr. João  ", crm: " 999 " });

    expect(prescriber.fullName).toBe("Dr. João");
    expect(prescriber.crm).toBe("999");
  });

  it.each([
    ["organizationId", { ...validProps, organizationId: "  " }],
    ["patientId", { ...validProps, patientId: "" }],
    ["fullName", { ...validProps, fullName: "   " }],
    ["crm", { ...validProps, crm: "" }],
  ])("rejects a blank %s", (_field, props) => {
    expect(() => Prescriber.create(props)).toThrow(DomainValidationError);
  });

  it("rejects an invalid UF", () => {
    expect(() => Prescriber.create({ ...validProps, crmState: "XX" })).toThrow(DomainValidationError);
  });

  it("updates the editable fields while keeping the identity", () => {
    const prescriber = Prescriber.create(validProps, "presc-1");

    prescriber.update({ fullName: "Dr. Novo Nome", crm: "654321", crmState: "rj" });

    expect(prescriber.id).toBe("presc-1");
    expect(prescriber.fullName).toBe("Dr. Novo Nome");
    expect(prescriber.crm).toBe("654321");
    expect(prescriber.crmState).toBe("RJ");
  });

  it("rejects an update with an invalid UF", () => {
    const prescriber = Prescriber.create(validProps);

    expect(() => prescriber.update({ fullName: "Dr. X", crm: "1", crmState: "ZZ" })).toThrow(
      DomainValidationError,
    );
  });
});

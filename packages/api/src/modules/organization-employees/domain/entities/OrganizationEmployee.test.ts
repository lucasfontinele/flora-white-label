import { describe, expect, it } from "vitest";
import { Entity } from "../../../../shared/domain/entities/Entity.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import { OrganizationEmployee } from "./OrganizationEmployee.js";

const baseProps = {
  organizationId: "organization-1",
  fullName: "  Maria Operadora  ",
  document: Document.create("529.982.247-25"),
  isActive: true,
};

describe("OrganizationEmployee", () => {
  it("creates a valid employee and trims the name", () => {
    const employee = OrganizationEmployee.create(baseProps, "employee-1");

    expect(employee).toBeInstanceOf(Entity);
    expect(employee.id).toBe("employee-1");
    expect(employee.organizationId).toBe("organization-1");
    expect(employee.fullName).toBe("Maria Operadora");
    expect(employee.document.value).toBe("52998224725");
    expect(employee.isActive).toBe(true);
  });

  it("rejects an empty organizationId or fullName", () => {
    expect(() => OrganizationEmployee.create({ ...baseProps, organizationId: " " })).toThrow(
      DomainValidationError,
    );
    expect(() => OrganizationEmployee.create({ ...baseProps, fullName: "   " })).toThrow(
      DomainValidationError,
    );
  });

  it("toggles the active status", () => {
    const employee = OrganizationEmployee.create(baseProps);

    employee.deactivate();
    expect(employee.isActive).toBe(false);

    employee.activate();
    expect(employee.isActive).toBe(true);
  });
});

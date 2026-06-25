import { describe, expect, it } from "vitest";
import { Role } from "./Role.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { PermissionAction } from "../enums/PermissionAction.js";
import { PermissionModule } from "../enums/PermissionModule.js";

function buildRole(overrides?: Partial<Parameters<typeof Role.create>[0]>) {
  return Role.create({
    organizationId: "org-1",
    name: "Operador",
    key: "OPERATOR",
    permissions: [{ module: PermissionModule.Orders, action: PermissionAction.View }],
    ...overrides,
  });
}

describe("Role", () => {
  it("creates a role and exposes its permissions", () => {
    const role = buildRole();

    expect(role.name).toBe("Operador");
    expect(role.key).toBe("OPERATOR");
    expect(role.hasPermission(PermissionModule.Orders, PermissionAction.View)).toBe(true);
    expect(role.hasPermission(PermissionModule.Orders, PermissionAction.Create)).toBe(false);
  });

  it("requires an organizationId and a name", () => {
    expect(() => buildRole({ organizationId: " " })).toThrow(DomainValidationError);
    expect(() => buildRole({ name: " " })).toThrow(DomainValidationError);
  });

  it("replaces and de-duplicates the permission grid", () => {
    const role = buildRole();

    role.setPermissions([
      { module: PermissionModule.Orders, action: PermissionAction.View },
      { module: PermissionModule.Orders, action: PermissionAction.View },
      { module: PermissionModule.Orders, action: PermissionAction.Edit },
    ]);

    expect(role.permissions).toHaveLength(2);
    expect(role.hasPermission(PermissionModule.Orders, PermissionAction.Edit)).toBe(true);
  });

  it("rejects invalid module or action entries", () => {
    const role = buildRole();

    expect(() =>
      role.setPermissions([
        { module: "NOPE" as PermissionModule, action: PermissionAction.View },
      ]),
    ).toThrow(DomainValidationError);
  });

  it("treats a full-access role as granting everything and blocks editing it", () => {
    const role = buildRole({ fullAccess: true, permissions: [] });

    expect(role.hasPermission(PermissionModule.Products, PermissionAction.Approve)).toBe(true);
    expect(() =>
      role.setPermissions([{ module: PermissionModule.Orders, action: PermissionAction.View }]),
    ).toThrow(DomainValidationError);
  });

  it("treats a view-all role as granting VIEW on every module", () => {
    const role = buildRole({ viewAll: true, permissions: [] });

    expect(role.hasPermission(PermissionModule.Inventory, PermissionAction.View)).toBe(true);
    expect(role.hasPermission(PermissionModule.Inventory, PermissionAction.Edit)).toBe(false);
  });
});

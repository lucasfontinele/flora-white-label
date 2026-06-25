import { describe, expect, it } from "vitest";
import {
  organizationParamsSchema,
  roleParamsSchema,
  setRolePermissionsBodySchema,
} from "./access-control-schemas.js";

describe("access control schemas", () => {
  it("validates path params", () => {
    expect(organizationParamsSchema.safeParse({ organizationId: "o1" }).success).toBe(true);
    expect(roleParamsSchema.safeParse({ organizationId: "o1", roleId: "r1" }).success).toBe(true);
    expect(roleParamsSchema.safeParse({ organizationId: " ", roleId: "r1" }).success).toBe(false);
  });

  it("accepts a valid permissions body", () => {
    expect(
      setRolePermissionsBodySchema.safeParse({
        permissions: [
          { module: "ORDERS", action: "VIEW" },
          { module: "ASSOCIATES", action: "APPROVE" },
        ],
      }).success,
    ).toBe(true);

    expect(setRolePermissionsBodySchema.safeParse({ permissions: [] }).success).toBe(true);
  });

  it("rejects unknown module/action or unknown fields", () => {
    expect(
      setRolePermissionsBodySchema.safeParse({
        permissions: [{ module: "REPORTS", action: "VIEW" }],
      }).success,
    ).toBe(false);

    expect(
      setRolePermissionsBodySchema.safeParse({
        permissions: [{ module: "ORDERS", action: "DELETE" }],
      }).success,
    ).toBe(false);

    expect(
      setRolePermissionsBodySchema.safeParse({
        permissions: [{ module: "ORDERS", action: "VIEW", extra: 1 }],
      }).success,
    ).toBe(false);
  });
});

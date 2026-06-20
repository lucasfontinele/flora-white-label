import { describe, expect, it } from "vitest";
import {
  authContextResponseSchema,
  authUserResponseSchema,
  loginBodySchema,
  loginResponseSchema,
} from "./auth-schemas.js";

describe("auth schemas", () => {
  it("accepts and normalizes a valid login body", () => {
    const result = loginBodySchema.safeParse({
      email: "  USER@Example.COM  ",
      password: " secret ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        email: "user@example.com",
        password: " secret ",
      });
    }
  });

  it("rejects invalid login bodies", () => {
    expect(loginBodySchema.safeParse({ email: "invalid", password: "secret" }).success).toBe(
      false,
    );
    expect(loginBodySchema.safeParse({ email: "user@example.com", password: " " }).success).toBe(
      false,
    );
    expect(loginBodySchema.safeParse({ email: "user@example.com" }).success).toBe(false);
    expect(loginBodySchema.safeParse({ password: "secret" }).success).toBe(false);
    expect(loginBodySchema.safeParse(null).success).toBe(false);
    expect(
      loginBodySchema.safeParse({
        email: "user@example.com",
        password: "secret",
        extra: "field",
      }).success,
    ).toBe(false);
  });

  it("keeps response schemas aligned with the login contract", () => {
    expect(authUserResponseSchema.properties.profile.enum).toEqual([
      "Master",
      "Organization",
      "Patient",
      "Guardian",
    ]);
    expect(authContextResponseSchema.properties.view.enum).toEqual([
      "BackofficeMaster",
      "Organization",
      "PatientPortal",
    ]);
    expect(authContextResponseSchema.required).toEqual([
      "view",
      "organizationId",
      "patientId",
      "organization",
      "guardian",
      "patient",
      "employee",
      "managedPatients",
    ]);
    expect(authUserResponseSchema.required).toEqual([
      "id",
      "email",
      "profile",
      "organizationId",
      "patientId",
    ]);
    expect(loginResponseSchema.required).toEqual(["accessToken", "user", "context"]);
  });
});

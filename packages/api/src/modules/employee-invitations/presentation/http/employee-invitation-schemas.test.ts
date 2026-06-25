import { describe, expect, it } from "vitest";
import {
  acceptInvitationBodySchema,
  sendInvitationBodySchema,
  tokenParamsSchema,
} from "./employee-invitation-schemas.js";

describe("employee invitation schemas", () => {
  it("validates and normalizes the send body", () => {
    const parsed = sendInvitationBodySchema.safeParse({
      email: "Person@Flora.LOCAL",
      roleId: "role-1",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("person@flora.local");
    }

    expect(sendInvitationBodySchema.safeParse({ email: "nope", roleId: "r" }).success).toBe(false);
    expect(sendInvitationBodySchema.safeParse({ email: "a@b.co" }).success).toBe(false);
  });

  it("validates the accept body and password length", () => {
    expect(
      acceptInvitationBodySchema.safeParse({
        fullName: "Maria",
        document: "39053344705",
        password: "Str0ngPass!",
      }).success,
    ).toBe(true);

    expect(
      acceptInvitationBodySchema.safeParse({
        fullName: "Maria",
        document: "39053344705",
        password: "short",
      }).success,
    ).toBe(false);

    expect(
      acceptInvitationBodySchema.safeParse({
        fullName: " ",
        document: "39053344705",
        password: "Str0ngPass!",
      }).success,
    ).toBe(false);
  });

  it("requires a non-blank token param", () => {
    expect(tokenParamsSchema.safeParse({ token: "abc" }).success).toBe(true);
    expect(tokenParamsSchema.safeParse({ token: " " }).success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { createAuthenticationUser, userCanAuthenticate } from "./user.js";
import { assertValidPasswordPolicy, validatePasswordPolicy } from "./user-password.js";

describe("user password policy", () => {
  it("accepts the local test password with lowercase letters and numbers", () => {
    expect(validatePasswordPolicy("Acesso@123")).toEqual({
      isValid: true,
      issues: [],
    });
  });

  it("rejects passwords with fewer than 8 characters", () => {
    expect(() => assertValidPasswordPolicy("abc123")).toThrow("Senha inválida.");
  });

  it("rejects passwords without lowercase letters", () => {
    expect(validatePasswordPolicy("ACESSO123").issues).toContain("A senha deve conter ao menos uma letra minúscula.");
  });

  it("rejects passwords without numbers", () => {
    expect(validatePasswordPolicy("Acesso@@@").issues).toContain("A senha deve conter ao menos um número.");
  });

  it("normalizes authentication user e-mails and keeps Master users platform-scoped", () => {
    const user = createAuthenticationUser({
      email: " MASTER@FLORA.LOCAL ",
      id: "user_master",
      isActive: true,
      organizationId: null,
      organizationIsActive: null,
      passwordHash: "$argon2id$v=19",
      type: "MASTER",
    });

    expect(user.email).toBe("master@flora.local");
    expect(userCanAuthenticate(user)).toBe(true);
  });

  it("rejects Master users with organization scope and inactive tenant users", () => {
    expect(() =>
      createAuthenticationUser({
        email: "master@flora.local",
        id: "user_master",
        isActive: true,
        organizationId: "org_1",
        organizationIsActive: true,
        passwordHash: "$argon2id$v=19",
        type: "MASTER",
      }),
    ).toThrow("Usuário de autenticação inválido.");

    expect(
      userCanAuthenticate({
        email: "organizacao@flora.local",
        id: "user_org",
        isActive: true,
        organizationId: "org_1",
        organizationIsActive: false,
        passwordHash: "$argon2id$v=19",
        type: "ORGANIZATION",
      }),
    ).toBe(false);
  });
});

import argon2 from "argon2";
import type { PasswordHasher } from "../../application/authentication/authentication-repository.js";
import { assertValidPasswordPolicy } from "../../domain/authentication/user-password.js";

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    assertValidPasswordPolicy(password);

    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  async verify(passwordHash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}

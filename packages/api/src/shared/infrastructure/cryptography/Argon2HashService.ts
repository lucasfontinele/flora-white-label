import argon2 from "argon2";
import type { HashService } from "../../application/cryptography/HashService.js";

/**
 * Argon2id-backed implementation of the {@link HashService} port.
 *
 * This is the only place in the codebase allowed to import `argon2` directly,
 * keeping the dependency isolated behind the application port.
 */
export class Argon2HashService implements HashService {
  public hash(value: string): Promise<string> {
    return argon2.hash(value, { type: argon2.argon2id });
  }

  public async verify(hash: string, value: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, value);
    } catch {
      return false;
    }
  }
}

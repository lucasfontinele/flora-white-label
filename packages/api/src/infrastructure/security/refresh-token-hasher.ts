import { createHash } from "node:crypto";
import type { RefreshTokenHasher } from "../../application/authentication/authentication-repository.js";

export class Sha256RefreshTokenHasher implements RefreshTokenHasher {
  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}

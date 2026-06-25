/**
 * Application port for one-way hashing (e.g. of secrets/passwords).
 *
 * The application layer depends only on this contract; the concrete algorithm
 * lives in the infrastructure layer. This keeps cryptography choices swappable
 * and prevents libraries such as Argon2 from leaking into domain/application
 * code.
 */
export interface HashService {
  hash(value: string): Promise<string>;
  verify(hash: string, value: string): Promise<boolean>;
}

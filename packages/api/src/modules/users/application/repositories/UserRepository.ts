import type { User } from "../../domain/entities/User.js";
import type { Email } from "../../domain/value-objects/Email.js";

export interface UserRepository {
  findByEmail(email: Email): Promise<User | null>;
  create(user: User): Promise<void>;
}

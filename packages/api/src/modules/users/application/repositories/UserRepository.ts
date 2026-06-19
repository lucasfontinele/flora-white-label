import type { User } from "../../domain/entities/User.js";
import type { Email } from "../../domain/value-objects/Email.js";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByEmailInOrganization(organizationId: string, email: Email): Promise<User | null>;
  create(user: User): Promise<void>;
  save(user: User): Promise<void>;
}

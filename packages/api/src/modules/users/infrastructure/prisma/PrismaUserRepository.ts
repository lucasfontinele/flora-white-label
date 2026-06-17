import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type { UserRepository } from "../../application/repositories/UserRepository.js";
import type { User } from "../../domain/entities/User.js";
import type { Email } from "../../domain/value-objects/Email.js";
import { UserMapper } from "./UserMapper.js";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.prisma.getClient().user.findFirst({
      where: { email: email.value },
    });

    return record ? UserMapper.toDomain(record) : null;
  }

  async create(user: User): Promise<void> {
    await this.prisma.getClient().user.create({
      data: UserMapper.toPersistence(user),
    });
  }
}

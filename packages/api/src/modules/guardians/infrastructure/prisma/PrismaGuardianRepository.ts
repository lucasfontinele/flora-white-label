import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type { GuardianRepository } from "../../application/repositories/GuardianRepository.js";
import type { Guardian } from "../../domain/entities/Guardian.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import { GuardianMapper } from "./GuardianMapper.js";

export class PrismaGuardianRepository implements GuardianRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByDocument(organizationId: string, document: Document): Promise<Guardian | null> {
    const record = await this.prisma.getClient().guardian.findFirst({
      where: { organizationId, document: document.value },
    });

    return record ? GuardianMapper.toDomain(record) : null;
  }

  async create(guardian: Guardian): Promise<void> {
    await this.prisma.getClient().guardian.create({
      data: GuardianMapper.toPersistence(guardian),
    });
  }
}

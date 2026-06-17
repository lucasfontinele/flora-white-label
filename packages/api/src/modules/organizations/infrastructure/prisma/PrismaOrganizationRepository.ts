import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type { OrganizationRepository } from "../../application/repositories/OrganizationRepository.js";
import type { Organization } from "../../domain/entities/Organization.js";
import type { Cnpj } from "../../domain/value-objects/Cnpj.js";
import { OrganizationMapper } from "./OrganizationMapper.js";

export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByCnpj(cnpj: Cnpj): Promise<Organization | null> {
    const record = await this.prisma.getClient().organization.findUnique({
      where: { cnpj: cnpj.value },
    });

    return record ? OrganizationMapper.toDomain(record) : null;
  }

  async create(organization: Organization): Promise<void> {
    await this.prisma.getClient().organization.create({
      data: OrganizationMapper.toPersistence(organization),
    });
  }
}

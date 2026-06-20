import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import type { OrganizationEmployeeRepository } from "../../application/repositories/OrganizationEmployeeRepository.js";
import type { OrganizationEmployee } from "../../domain/entities/OrganizationEmployee.js";
import { OrganizationEmployeeMapper } from "./OrganizationEmployeeMapper.js";

export class PrismaOrganizationEmployeeRepository implements OrganizationEmployeeRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findById(id: string): Promise<OrganizationEmployee | null> {
    const record = await this.prisma.getClient().organizationEmployee.findUnique({
      where: { id },
    });

    return record ? OrganizationEmployeeMapper.toDomain(record) : null;
  }

  async findByDocument(
    organizationId: string,
    document: Document,
  ): Promise<OrganizationEmployee | null> {
    const record = await this.prisma.getClient().organizationEmployee.findFirst({
      where: { organizationId, document: document.value },
    });

    return record ? OrganizationEmployeeMapper.toDomain(record) : null;
  }

  async create(employee: OrganizationEmployee): Promise<void> {
    await this.prisma.getClient().organizationEmployee.create({
      data: OrganizationEmployeeMapper.toPersistence(employee),
    });
  }
}

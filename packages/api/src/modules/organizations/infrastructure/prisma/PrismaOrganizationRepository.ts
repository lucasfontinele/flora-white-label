import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  OrganizationReadModel,
  OrganizationRepository,
} from "../../application/repositories/OrganizationRepository.js";
import type { Organization } from "../../domain/entities/Organization.js";
import type { Cnpj } from "../../domain/value-objects/Cnpj.js";
import { OrganizationMapper } from "./OrganizationMapper.js";

const organizationDetailsInclude = {
  address: true,
  currentPlan: true,
} as const;

export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByCnpj(cnpj: Cnpj): Promise<Organization | null> {
    const record = await this.prisma.getClient().organization.findUnique({
      where: { cnpj: cnpj.value },
    });

    return record ? OrganizationMapper.toDomain(record) : null;
  }

  async findByCnpjExcludingId(cnpj: Cnpj, id: string): Promise<Organization | null> {
    const record = await this.prisma.getClient().organization.findFirst({
      where: {
        cnpj: cnpj.value,
        id: { not: id },
      },
    });

    return record ? OrganizationMapper.toDomain(record) : null;
  }

  async findById(id: string): Promise<Organization | null> {
    const record = await this.prisma.getClient().organization.findUnique({
      where: { id },
    });

    return record ? OrganizationMapper.toDomain(record) : null;
  }

  async findDetailsById(id: string): Promise<OrganizationReadModel | null> {
    const record = await this.prisma.getClient().organization.findUnique({
      where: { id },
      include: organizationDetailsInclude,
    });

    return record ? OrganizationMapper.toReadModel(record) : null;
  }

  async findAllDetails(): Promise<OrganizationReadModel[]> {
    const records = await this.prisma.getClient().organization.findMany({
      include: organizationDetailsInclude,
      orderBy: { createdAt: "asc" },
    });

    return records.map((record) => OrganizationMapper.toReadModel(record));
  }

  async create(organization: Organization): Promise<void> {
    await this.prisma.getClient().organization.create({
      data: OrganizationMapper.toPersistence(organization),
    });
  }

  async save(organization: Organization): Promise<void> {
    await this.prisma.getClient().organization.update({
      where: { id: organization.id },
      data: OrganizationMapper.toUpdatePersistence(organization),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.getClient().organization.delete({
      where: { id },
    });
  }
}

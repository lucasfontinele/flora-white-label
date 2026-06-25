import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  OrganizationRequiredDocumentReadModel,
  OrganizationRequiredDocumentRepository,
} from "../../application/repositories/OrganizationRequiredDocumentRepository.js";
import type { OrganizationRequiredDocument } from "../../domain/entities/OrganizationRequiredDocument.js";
import { OrganizationRequiredDocumentMapper } from "./OrganizationRequiredDocumentMapper.js";

export class PrismaOrganizationRequiredDocumentRepository
  implements OrganizationRequiredDocumentRepository
{
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByIdInOrganization(
    organizationId: string,
    documentId: string,
  ): Promise<OrganizationRequiredDocument | null> {
    const record = await this.prisma.getClient().organizationRequiredDocument.findFirst({
      where: { id: documentId, organizationId },
    });

    return record ? OrganizationRequiredDocumentMapper.toDomain(record) : null;
  }

  async findDetailsByIdInOrganization(
    organizationId: string,
    documentId: string,
  ): Promise<OrganizationRequiredDocumentReadModel | null> {
    const record = await this.prisma.getClient().organizationRequiredDocument.findFirst({
      where: { id: documentId, organizationId },
    });

    return record ? OrganizationRequiredDocumentMapper.toReadModel(record) : null;
  }

  async findByNameInOrganization(
    organizationId: string,
    name: string,
  ): Promise<OrganizationRequiredDocument | null> {
    const record = await this.prisma.getClient().organizationRequiredDocument.findUnique({
      where: { organizationId_name: { organizationId, name } },
    });

    return record ? OrganizationRequiredDocumentMapper.toDomain(record) : null;
  }

  async findByNameInOrganizationExcludingId(
    organizationId: string,
    name: string,
    documentId: string,
  ): Promise<OrganizationRequiredDocument | null> {
    const record = await this.prisma.getClient().organizationRequiredDocument.findFirst({
      where: { organizationId, name, id: { not: documentId } },
    });

    return record ? OrganizationRequiredDocumentMapper.toDomain(record) : null;
  }

  async findAllByOrganization(organizationId: string): Promise<OrganizationRequiredDocumentReadModel[]> {
    const records = await this.prisma.getClient().organizationRequiredDocument.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    });

    return records.map((record) => OrganizationRequiredDocumentMapper.toReadModel(record));
  }

  async create(document: OrganizationRequiredDocument): Promise<OrganizationRequiredDocumentReadModel> {
    const record = await this.prisma.getClient().organizationRequiredDocument.create({
      data: OrganizationRequiredDocumentMapper.toPersistence(document),
    });

    return OrganizationRequiredDocumentMapper.toReadModel(record);
  }

  async save(document: OrganizationRequiredDocument): Promise<OrganizationRequiredDocumentReadModel> {
    const record = await this.prisma.getClient().organizationRequiredDocument.update({
      where: { id: document.id },
      data: OrganizationRequiredDocumentMapper.toUpdatePersistence(document),
    });

    return OrganizationRequiredDocumentMapper.toReadModel(record);
  }

  async delete(documentId: string): Promise<void> {
    await this.prisma.getClient().organizationRequiredDocument.delete({
      where: { id: documentId },
    });
  }

  async hasApprovals(documentId: string): Promise<boolean> {
    const count = await this.prisma.getClient().organizationDocumentPatientApproval.count({
      where: { documentId },
    });

    return count > 0;
  }
}

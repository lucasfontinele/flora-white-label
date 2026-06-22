import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  OrganizationDocumentPatientApprovalReadModel,
  OrganizationDocumentPatientApprovalRepository,
} from "../../application/repositories/OrganizationDocumentPatientApprovalRepository.js";
import type { OrganizationDocumentPatientApproval } from "../../domain/entities/OrganizationDocumentPatientApproval.js";
import { OrganizationDocumentPatientApprovalMapper } from "./OrganizationDocumentPatientApprovalMapper.js";

export class PrismaOrganizationDocumentPatientApprovalRepository
  implements OrganizationDocumentPatientApprovalRepository
{
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByIdForPatientInOrganization(
    organizationId: string,
    patientId: string,
    approvalId: string,
  ): Promise<OrganizationDocumentPatientApproval | null> {
    const record = await this.prisma.getClient().organizationDocumentPatientApproval.findFirst({
      where: {
        id: approvalId,
        organizationId,
        patientId,
      },
    });

    return record ? OrganizationDocumentPatientApprovalMapper.toDomain(record) : null;
  }

  async findDetailsByIdForPatientInOrganization(
    organizationId: string,
    patientId: string,
    approvalId: string,
  ): Promise<OrganizationDocumentPatientApprovalReadModel | null> {
    const record = await this.prisma.getClient().organizationDocumentPatientApproval.findFirst({
      where: {
        id: approvalId,
        organizationId,
        patientId,
      },
    });

    return record ? OrganizationDocumentPatientApprovalMapper.toReadModel(record) : null;
  }

  async findByDocumentAndPatient(
    documentId: string,
    patientId: string,
  ): Promise<OrganizationDocumentPatientApproval | null> {
    const record = await this.prisma.getClient().organizationDocumentPatientApproval.findUnique({
      where: { documentId_patientId: { documentId, patientId } },
    });

    return record ? OrganizationDocumentPatientApprovalMapper.toDomain(record) : null;
  }

  async findAllByPatientInOrganization(
    organizationId: string,
    patientId: string,
  ): Promise<OrganizationDocumentPatientApprovalReadModel[]> {
    const records = await this.prisma.getClient().organizationDocumentPatientApproval.findMany({
      where: {
        organizationId,
        patientId,
      },
      orderBy: { createdAt: "asc" },
    });

    return records.map((record) => OrganizationDocumentPatientApprovalMapper.toReadModel(record));
  }

  async create(
    approval: OrganizationDocumentPatientApproval,
  ): Promise<OrganizationDocumentPatientApprovalReadModel> {
    const record = await this.prisma.getClient().organizationDocumentPatientApproval.create({
      data: OrganizationDocumentPatientApprovalMapper.toPersistence(approval),
    });

    return OrganizationDocumentPatientApprovalMapper.toReadModel(record);
  }

  async save(
    approval: OrganizationDocumentPatientApproval,
  ): Promise<OrganizationDocumentPatientApprovalReadModel> {
    const record = await this.prisma.getClient().organizationDocumentPatientApproval.update({
      where: { id: approval.id },
      data: OrganizationDocumentPatientApprovalMapper.toUpdatePersistence(approval),
    });

    return OrganizationDocumentPatientApprovalMapper.toReadModel(record);
  }
}

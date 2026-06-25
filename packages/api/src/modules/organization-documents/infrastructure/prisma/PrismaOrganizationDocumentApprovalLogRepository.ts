import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  OrganizationDocumentApprovalLogReadModel,
  OrganizationDocumentApprovalLogRepository,
} from "../../application/repositories/OrganizationDocumentApprovalLogRepository.js";
import type { OrganizationDocumentApprovalLog } from "../../domain/entities/OrganizationDocumentApprovalLog.js";
import { OrganizationDocumentApprovalLogMapper } from "./OrganizationDocumentApprovalLogMapper.js";

export class PrismaOrganizationDocumentApprovalLogRepository
  implements OrganizationDocumentApprovalLogRepository
{
  constructor(private readonly prisma: TransactionalPrisma) {}

  async create(log: OrganizationDocumentApprovalLog): Promise<OrganizationDocumentApprovalLogReadModel> {
    const record = await this.prisma.getClient().organizationDocumentApprovalLog.create({
      data: OrganizationDocumentApprovalLogMapper.toPersistence(log),
    });

    return OrganizationDocumentApprovalLogMapper.toReadModel(record);
  }

  async findAllByPatientApproval(
    patientApprovalId: string,
  ): Promise<OrganizationDocumentApprovalLogReadModel[]> {
    const records = await this.prisma.getClient().organizationDocumentApprovalLog.findMany({
      where: { patientApprovalId },
      orderBy: { createdAt: "asc" },
    });

    return records.map((record) => OrganizationDocumentApprovalLogMapper.toReadModel(record));
  }
}

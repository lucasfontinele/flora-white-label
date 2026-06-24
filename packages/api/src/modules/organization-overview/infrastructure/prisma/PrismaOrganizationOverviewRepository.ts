import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import type { OrganizationOverviewRepository } from "../../application/repositories/OrganizationOverviewRepository.js";

export class PrismaOrganizationOverviewRepository implements OrganizationOverviewRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async countOrders(organizationId: string): Promise<number> {
    return this.prisma.getClient().order.count({ where: { organizationId } });
  }

  async countPatientsByStatus(organizationId: string, status: PatientStatus): Promise<number> {
    return this.prisma.getClient().patient.count({
      where: { organizationId, patientStatus: status },
    });
  }
}

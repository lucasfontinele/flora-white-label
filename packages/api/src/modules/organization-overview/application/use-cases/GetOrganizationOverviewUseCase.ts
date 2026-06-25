import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import type { OrganizationOverviewRepository } from "../repositories/OrganizationOverviewRepository.js";

export interface GetOrganizationOverviewInput {
  organizationId: string;
}

export interface OrganizationOverview {
  /** Total number of orders in the organization. */
  ordersCount: number;
  /** Patients awaiting validation (status WAITING_APPROVAL). */
  pendingApprovalsCount: number;
}

export class GetOrganizationOverviewUseCase {
  constructor(private readonly overviewRepository: OrganizationOverviewRepository) {}

  async execute(input: GetOrganizationOverviewInput): Promise<OrganizationOverview> {
    const [ordersCount, pendingApprovalsCount] = await Promise.all([
      this.overviewRepository.countOrders(input.organizationId),
      this.overviewRepository.countPatientsByStatus(
        input.organizationId,
        PatientStatus.WaitingApproval,
      ),
    ]);

    return { ordersCount, pendingApprovalsCount };
  }
}

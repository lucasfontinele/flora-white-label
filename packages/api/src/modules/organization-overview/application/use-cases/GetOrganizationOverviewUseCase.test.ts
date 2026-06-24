import { describe, expect, it } from "vitest";
import { GetOrganizationOverviewUseCase } from "./GetOrganizationOverviewUseCase.js";
import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import type { OrganizationOverviewRepository } from "../repositories/OrganizationOverviewRepository.js";

class FakeOrganizationOverviewRepository implements OrganizationOverviewRepository {
  ordersByOrg = new Map<string, number>();
  patientsByOrgAndStatus = new Map<string, number>();

  async countOrders(organizationId: string): Promise<number> {
    return this.ordersByOrg.get(organizationId) ?? 0;
  }

  async countPatientsByStatus(organizationId: string, status: PatientStatus): Promise<number> {
    return this.patientsByOrgAndStatus.get(`${organizationId}:${status}`) ?? 0;
  }
}

describe("GetOrganizationOverviewUseCase", () => {
  it("returns the total orders and the patients awaiting validation", async () => {
    const repository = new FakeOrganizationOverviewRepository();
    repository.ordersByOrg.set("org-1", 7);
    repository.patientsByOrgAndStatus.set(`org-1:${PatientStatus.WaitingApproval}`, 3);

    const useCase = new GetOrganizationOverviewUseCase(repository);
    const result = await useCase.execute({ organizationId: "org-1" });

    expect(result).toEqual({ ordersCount: 7, pendingApprovalsCount: 3 });
  });

  it("counts only WAITING_APPROVAL patients and is organization-scoped", async () => {
    const repository = new FakeOrganizationOverviewRepository();
    // Patients in other statuses or other orgs must not be counted.
    repository.patientsByOrgAndStatus.set(`org-1:${PatientStatus.WaitingApproval}`, 2);
    repository.patientsByOrgAndStatus.set(`org-1:${PatientStatus.Approval}`, 5);
    repository.patientsByOrgAndStatus.set(`org-2:${PatientStatus.WaitingApproval}`, 9);

    const useCase = new GetOrganizationOverviewUseCase(repository);
    const result = await useCase.execute({ organizationId: "org-1" });

    expect(result.pendingApprovalsCount).toBe(2);
    expect(result.ordersCount).toBe(0);
  });
});

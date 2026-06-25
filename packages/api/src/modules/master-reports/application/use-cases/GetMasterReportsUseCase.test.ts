import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "../../../../shared/application/errors/ForbiddenError.js";
import { GetMasterReportsUseCase } from "./GetMasterReportsUseCase.js";
import type { MasterAccessRepository } from "../repositories/MasterAccessRepository.js";
import type {
  MasterReports,
  MasterReportsFilter,
  MasterReportsRepository,
} from "../repositories/MasterReportsRepository.js";

const REPORTS: MasterReports = {
  metrics: [
    { delta: "+5", hint: "novas no mês", icon: "store", label: "Organizações ativas", tone: "success", value: "48" },
  ],
  monthlyOrganizations: {
    points: [{ month: "Jan", value: 31 }],
    growthLabel: "+54% no semestre",
  },
  networkHealth: [{ icon: "bar-chart-3", label: "Ticket médio por pedido", value: "R$ 312" }],
  planDistribution: [{ name: "Starter", organizations: 22, percentage: 46 }],
  recentOrganizations: [
    { createdAt: "12 jun 2026", city: "Palmas", plan: "Growth", state: "TO", tradeName: "Verde Vida" },
  ],
  referenceLabel: "Junho 2026",
};

function reportsRepository(filterSpy?: (filter: MasterReportsFilter) => void): MasterReportsRepository {
  return {
    async getReports(filter) {
      filterSpy?.(filter);
      return REPORTS;
    },
  };
}

function masterAccess(isMaster: boolean): MasterAccessRepository {
  return { isMaster: async () => isMaster };
}

describe("GetMasterReportsUseCase", () => {
  it("returns the reports for an active Master user", async () => {
    const useCase = new GetMasterReportsUseCase({
      masterAccessRepository: masterAccess(true),
      reportsRepository: reportsRepository(),
    });

    await expect(
      useCase.execute({ requesterUserId: "master-1", organizationIds: [] }),
    ).resolves.toEqual(REPORTS);
  });

  it("forwards the organization filter to the repository", async () => {
    const spy = vi.fn();
    const useCase = new GetMasterReportsUseCase({
      masterAccessRepository: masterAccess(true),
      reportsRepository: reportsRepository(spy),
    });

    await useCase.execute({ requesterUserId: "master-1", organizationIds: ["org-1", "org-2"] });

    expect(spy).toHaveBeenCalledWith({ organizationIds: ["org-1", "org-2"] });
  });

  it("forbids requesters that are not Master users", async () => {
    const useCase = new GetMasterReportsUseCase({
      masterAccessRepository: masterAccess(false),
      reportsRepository: reportsRepository(),
    });

    await expect(
      useCase.execute({ requesterUserId: "operator-1", organizationIds: [] }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("forbids requests without an identified requester", async () => {
    const isMaster = vi.fn(async () => true);
    const useCase = new GetMasterReportsUseCase({
      masterAccessRepository: { isMaster },
      reportsRepository: reportsRepository(),
    });

    await expect(
      useCase.execute({ requesterUserId: "   ", organizationIds: [] }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(isMaster).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";
import { ForbiddenError } from "../../../../shared/application/errors/ForbiddenError.js";
import {
  type EmployeePermissionsReader,
  GetOperationalDashboardUseCase,
} from "./GetOperationalDashboardUseCase.js";
import type {
  OperationalDashboardRepository,
  OperationalDashboardSummary,
} from "../repositories/OperationalDashboardRepository.js";

const SUMMARY: OperationalDashboardSummary = {
  lowStock: [{ amount: "4 un.", name: "Óleo CBD 17%", tone: "error" }],
  metrics: [{ delta: "+4", hint: "aguardando ação", icon: "inbox", label: "Pedidos pendentes", value: "12" }],
  ordersByStatus: [{ count: 12, status: "Solicitado" }],
  referenceLabel: "Junho 2026",
};

class StubDashboardRepository implements OperationalDashboardRepository {
  async getSummary(): Promise<OperationalDashboardSummary> {
    return SUMMARY;
  }
}

function permissionsReader(perms: { fullAccess: boolean; viewAll: boolean }): EmployeePermissionsReader {
  return { execute: async () => perms };
}

function buildUseCase(perms: { fullAccess: boolean; viewAll: boolean }) {
  return new GetOperationalDashboardUseCase({
    getEmployeePermissionsUseCase: permissionsReader(perms),
    dashboardRepository: new StubDashboardRepository(),
  });
}

describe("GetOperationalDashboardUseCase", () => {
  it("returns the summary for a Diretoria role (viewAll)", async () => {
    const useCase = buildUseCase({ fullAccess: false, viewAll: true });

    await expect(useCase.execute({ organizationId: "org-1", employeeId: "emp-1" })).resolves.toEqual(
      SUMMARY,
    );
  });

  it("returns the summary for a full-access role (Super admin)", async () => {
    const useCase = buildUseCase({ fullAccess: true, viewAll: false });

    await expect(useCase.execute({ organizationId: "org-1", employeeId: "emp-1" })).resolves.toEqual(
      SUMMARY,
    );
  });

  it("forbids roles that are not 'diretoria pra cima'", async () => {
    const useCase = buildUseCase({ fullAccess: false, viewAll: false });

    await expect(useCase.execute({ organizationId: "org-1", employeeId: "emp-1" })).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});

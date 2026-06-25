import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { makeAccessControlUseCases } from "../../access-control/infrastructure/create-access-control-use-cases.factory.js";
import { GetOperationalDashboardUseCase } from "../application/use-cases/GetOperationalDashboardUseCase.js";
import { PrismaOperationalDashboardRepository } from "./prisma/PrismaOperationalDashboardRepository.js";

export interface OperationalDashboardUseCases {
  getOperationalDashboardUseCase: GetOperationalDashboardUseCase;
}

export function makeOperationalDashboardUseCases(
  prisma: PrismaService,
): OperationalDashboardUseCases {
  // Reuse the access-control read path so authorization stays in one place.
  const { getEmployeePermissionsUseCase } = makeAccessControlUseCases(prisma);
  const transactionManager = new PrismaTransactionManager(prisma);
  const dashboardRepository = new PrismaOperationalDashboardRepository(transactionManager);

  return {
    getOperationalDashboardUseCase: new GetOperationalDashboardUseCase({
      getEmployeePermissionsUseCase,
      dashboardRepository,
    }),
  };
}

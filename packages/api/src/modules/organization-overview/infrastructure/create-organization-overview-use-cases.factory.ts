import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { GetOrganizationOverviewUseCase } from "../application/use-cases/GetOrganizationOverviewUseCase.js";
import { PrismaOrganizationOverviewRepository } from "./prisma/PrismaOrganizationOverviewRepository.js";

export interface OrganizationOverviewUseCases {
  getOrganizationOverviewUseCase: GetOrganizationOverviewUseCase;
}

export function makeOrganizationOverviewUseCases(
  prisma: PrismaService,
): OrganizationOverviewUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const overviewRepository = new PrismaOrganizationOverviewRepository(transactionManager);

  return {
    getOrganizationOverviewUseCase: new GetOrganizationOverviewUseCase(overviewRepository),
  };
}

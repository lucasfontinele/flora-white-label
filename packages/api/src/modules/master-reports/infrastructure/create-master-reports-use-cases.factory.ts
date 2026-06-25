import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { GetMasterReportsUseCase } from "../application/use-cases/GetMasterReportsUseCase.js";
import { PrismaMasterAccessRepository } from "./prisma/PrismaMasterAccessRepository.js";
import { PrismaMasterReportsRepository } from "./prisma/PrismaMasterReportsRepository.js";

export interface MasterReportsUseCases {
  getMasterReportsUseCase: GetMasterReportsUseCase;
}

export function makeMasterReportsUseCases(prisma: PrismaService): MasterReportsUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const masterAccessRepository = new PrismaMasterAccessRepository(transactionManager);
  const reportsRepository = new PrismaMasterReportsRepository(transactionManager);

  return {
    getMasterReportsUseCase: new GetMasterReportsUseCase({
      masterAccessRepository,
      reportsRepository,
    }),
  };
}

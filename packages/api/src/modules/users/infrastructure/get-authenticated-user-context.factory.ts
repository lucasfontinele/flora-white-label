import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { GetAuthenticatedUserContextUseCase } from "../application/use-cases/GetAuthenticatedUserContextUseCase.js";
import { PrismaAuthenticatedUserContextRepository } from "./prisma/PrismaAuthenticatedUserContextRepository.js";

export function makeGetAuthenticatedUserContextUseCase(
  prisma: PrismaService,
): GetAuthenticatedUserContextUseCase {
  const transactionManager = new PrismaTransactionManager(prisma);

  return new GetAuthenticatedUserContextUseCase({
    contextRepository: new PrismaAuthenticatedUserContextRepository(transactionManager),
  });
}

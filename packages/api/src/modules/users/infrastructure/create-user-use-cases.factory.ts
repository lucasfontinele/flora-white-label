import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { ListOrganizationAssociatesUseCase } from "../application/use-cases/ListOrganizationAssociatesUseCase.js";
import { SetUserAccessUseCase } from "../application/use-cases/SetUserAccessUseCase.js";
import { PrismaOrganizationAssociateRepository } from "./prisma/PrismaOrganizationAssociateRepository.js";
import { PrismaUserRepository } from "./prisma/PrismaUserRepository.js";

export interface UserUseCases {
  listOrganizationAssociatesUseCase: ListOrganizationAssociatesUseCase;
  setUserAccessUseCase: SetUserAccessUseCase;
}

export function makeUserUseCases(prisma: PrismaService): UserUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const associateRepository = new PrismaOrganizationAssociateRepository(transactionManager);
  const userRepository = new PrismaUserRepository(transactionManager);

  return {
    listOrganizationAssociatesUseCase: new ListOrganizationAssociatesUseCase({
      associateRepository,
    }),
    setUserAccessUseCase: new SetUserAccessUseCase({
      userRepository,
      unitOfWork: transactionManager,
    }),
  };
}

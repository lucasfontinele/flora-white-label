import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { PrismaOrganizationRepository } from "../../organizations/infrastructure/prisma/PrismaOrganizationRepository.js";
import { PrismaUserRepository } from "../../users/infrastructure/prisma/PrismaUserRepository.js";
import { CreateOrganizationEmployeeUseCase } from "../application/use-cases/CreateOrganizationEmployeeUseCase.js";
import { PrismaOrganizationEmployeeRepository } from "./prisma/PrismaOrganizationEmployeeRepository.js";

/**
 * Composition root for the create-organization-employee use case. No HTTP/
 * controller wiring here — that belongs to a later step of the feature.
 */
export function makeCreateOrganizationEmployeeUseCase(
  prisma: PrismaService,
): CreateOrganizationEmployeeUseCase {
  const transactionManager = new PrismaTransactionManager(prisma);

  return new CreateOrganizationEmployeeUseCase({
    organizationEmployeeRepository: new PrismaOrganizationEmployeeRepository(transactionManager),
    organizationRepository: new PrismaOrganizationRepository(transactionManager),
    userRepository: new PrismaUserRepository(transactionManager),
    unitOfWork: transactionManager,
  });
}

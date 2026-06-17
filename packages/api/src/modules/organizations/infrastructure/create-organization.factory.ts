import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { PrismaSubscriptionPlanRepository } from "../../subscription-plans/infrastructure/prisma/PrismaSubscriptionPlanRepository.js";
import { PrismaAddressRepository } from "../../addresses/infrastructure/prisma/PrismaAddressRepository.js";
import { PrismaOrganizationRepository } from "./prisma/PrismaOrganizationRepository.js";
import { CreateOrganizationUseCase } from "../application/use-cases/CreateOrganizationUseCase.js";

/**
 * Composition root for the organization-registration use case: wires the Prisma
 * repositories and the Prisma-backed unit of work. No HTTP/controller wiring.
 */
export function makeCreateOrganizationUseCase(prisma: PrismaService): CreateOrganizationUseCase {
  const transactionManager = new PrismaTransactionManager(prisma);

  return new CreateOrganizationUseCase({
    subscriptionPlanRepository: new PrismaSubscriptionPlanRepository(transactionManager),
    organizationRepository: new PrismaOrganizationRepository(transactionManager),
    addressRepository: new PrismaAddressRepository(transactionManager),
    unitOfWork: transactionManager,
  });
}

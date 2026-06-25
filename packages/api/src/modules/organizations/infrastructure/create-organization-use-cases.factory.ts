import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { PrismaAddressRepository } from "../../addresses/infrastructure/prisma/PrismaAddressRepository.js";
import { PrismaSubscriptionPlanRepository } from "../../subscription-plans/infrastructure/prisma/PrismaSubscriptionPlanRepository.js";
import { CreateOrganizationUseCase } from "../application/use-cases/CreateOrganizationUseCase.js";
import { DeleteOrganizationUseCase } from "../application/use-cases/DeleteOrganizationUseCase.js";
import { GetOrganizationByIdUseCase } from "../application/use-cases/GetOrganizationByIdUseCase.js";
import { GetOrganizationBySlugUseCase } from "../application/use-cases/GetOrganizationBySlugUseCase.js";
import { ListOrganizationsUseCase } from "../application/use-cases/ListOrganizationsUseCase.js";
import { UpdateOrganizationUseCase } from "../application/use-cases/UpdateOrganizationUseCase.js";
import { PrismaOrganizationRepository } from "./prisma/PrismaOrganizationRepository.js";

export interface OrganizationUseCases {
  createOrganizationUseCase: CreateOrganizationUseCase;
  listOrganizationsUseCase: ListOrganizationsUseCase;
  getOrganizationByIdUseCase: GetOrganizationByIdUseCase;
  getOrganizationBySlugUseCase: GetOrganizationBySlugUseCase;
  updateOrganizationUseCase: UpdateOrganizationUseCase;
  deleteOrganizationUseCase: DeleteOrganizationUseCase;
}

export function makeOrganizationUseCases(prisma: PrismaService): OrganizationUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const organizationRepository = new PrismaOrganizationRepository(transactionManager);
  const addressRepository = new PrismaAddressRepository(transactionManager);
  const subscriptionPlanRepository = new PrismaSubscriptionPlanRepository(transactionManager);

  return {
    createOrganizationUseCase: new CreateOrganizationUseCase({
      subscriptionPlanRepository,
      organizationRepository,
      addressRepository,
      unitOfWork: transactionManager,
    }),
    listOrganizationsUseCase: new ListOrganizationsUseCase(organizationRepository),
    getOrganizationByIdUseCase: new GetOrganizationByIdUseCase(organizationRepository),
    getOrganizationBySlugUseCase: new GetOrganizationBySlugUseCase(organizationRepository),
    updateOrganizationUseCase: new UpdateOrganizationUseCase({
      subscriptionPlanRepository,
      organizationRepository,
      addressRepository,
      unitOfWork: transactionManager,
    }),
    deleteOrganizationUseCase: new DeleteOrganizationUseCase({
      organizationRepository,
      addressRepository,
      unitOfWork: transactionManager,
    }),
  };
}

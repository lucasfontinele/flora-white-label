import { env } from "../../../config/env.js";
import { Argon2HashService } from "../../../shared/infrastructure/cryptography/Argon2HashService.js";
import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { makeEmailService } from "../../../shared/infrastructure/email/make-email-service.factory.js";
import { PrismaRoleRepository } from "../../access-control/infrastructure/prisma/PrismaRoleRepository.js";
import { PrismaMasterAccessRepository } from "../../master-reports/infrastructure/prisma/PrismaMasterAccessRepository.js";
import { PrismaOrganizationRepository } from "../../organizations/infrastructure/prisma/PrismaOrganizationRepository.js";
import { PrismaOrganizationEmployeeRepository } from "../../organization-employees/infrastructure/prisma/PrismaOrganizationEmployeeRepository.js";
import { PrismaUserRepository } from "../../users/infrastructure/prisma/PrismaUserRepository.js";
import { AcceptEmployeeInvitationUseCase } from "../application/use-cases/AcceptEmployeeInvitationUseCase.js";
import { GetEmployeeInvitationByTokenUseCase } from "../application/use-cases/GetEmployeeInvitationByTokenUseCase.js";
import { ListEmployeeInvitationsUseCase } from "../application/use-cases/ListEmployeeInvitationsUseCase.js";
import { ListOrganizationAdminInvitationsUseCase } from "../application/use-cases/ListOrganizationAdminInvitationsUseCase.js";
import { ResendEmployeeInvitationUseCase } from "../application/use-cases/ResendEmployeeInvitationUseCase.js";
import { SendEmployeeInvitationUseCase } from "../application/use-cases/SendEmployeeInvitationUseCase.js";
import { SendOrganizationAdminInvitationUseCase } from "../application/use-cases/SendOrganizationAdminInvitationUseCase.js";
import { PrismaEmployeeInvitationRepository } from "./prisma/PrismaEmployeeInvitationRepository.js";

export interface EmployeeInvitationUseCases {
  sendEmployeeInvitationUseCase: SendEmployeeInvitationUseCase;
  resendEmployeeInvitationUseCase: ResendEmployeeInvitationUseCase;
  listEmployeeInvitationsUseCase: ListEmployeeInvitationsUseCase;
  getEmployeeInvitationByTokenUseCase: GetEmployeeInvitationByTokenUseCase;
  acceptEmployeeInvitationUseCase: AcceptEmployeeInvitationUseCase;
  sendOrganizationAdminInvitationUseCase: SendOrganizationAdminInvitationUseCase;
  listOrganizationAdminInvitationsUseCase: ListOrganizationAdminInvitationsUseCase;
}

export function makeEmployeeInvitationUseCases(prisma: PrismaService): EmployeeInvitationUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const invitationRepository = new PrismaEmployeeInvitationRepository(transactionManager);
  const roleRepository = new PrismaRoleRepository(transactionManager);
  const organizationRepository = new PrismaOrganizationRepository(transactionManager);
  const masterAccessRepository = new PrismaMasterAccessRepository(transactionManager);
  const organizationEmployeeRepository = new PrismaOrganizationEmployeeRepository(
    transactionManager,
  );
  const userRepository = new PrismaUserRepository(transactionManager);
  const hashService = new Argon2HashService();
  const emailService = makeEmailService();

  return {
    sendEmployeeInvitationUseCase: new SendEmployeeInvitationUseCase({
      invitationRepository,
      roleRepository,
      emailService,
      unitOfWork: transactionManager,
      webAppUrl: env.WEB_APP_URL,
    }),
    resendEmployeeInvitationUseCase: new ResendEmployeeInvitationUseCase({
      invitationRepository,
      emailService,
      unitOfWork: transactionManager,
      webAppUrl: env.WEB_APP_URL,
    }),
    listEmployeeInvitationsUseCase: new ListEmployeeInvitationsUseCase(invitationRepository),
    getEmployeeInvitationByTokenUseCase: new GetEmployeeInvitationByTokenUseCase(
      invitationRepository,
    ),
    acceptEmployeeInvitationUseCase: new AcceptEmployeeInvitationUseCase({
      invitationRepository,
      organizationEmployeeRepository,
      userRepository,
      hashService,
      unitOfWork: transactionManager,
    }),
    sendOrganizationAdminInvitationUseCase: new SendOrganizationAdminInvitationUseCase({
      masterAccessRepository,
      organizationRepository,
      roleRepository,
      invitationRepository,
      emailService,
      unitOfWork: transactionManager,
      webAppUrl: env.WEB_APP_URL,
    }),
    listOrganizationAdminInvitationsUseCase: new ListOrganizationAdminInvitationsUseCase({
      masterAccessRepository,
      invitationRepository,
    }),
  };
}

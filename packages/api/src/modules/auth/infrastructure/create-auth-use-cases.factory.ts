import { env } from "../../../config/env.js";
import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { Argon2HashService } from "../../../shared/infrastructure/cryptography/Argon2HashService.js";
import { JoseJwtService } from "../../../shared/infrastructure/tokens/JoseJwtService.js";
import { RefreshPatientRegistrationStatusUseCase } from "../../organization-documents/application/use-cases/RefreshPatientRegistrationStatusUseCase.js";
import { PrismaOrganizationDocumentPatientApprovalRepository } from "../../organization-documents/infrastructure/prisma/PrismaOrganizationDocumentPatientApprovalRepository.js";
import { PrismaOrganizationRequiredDocumentRepository } from "../../organization-documents/infrastructure/prisma/PrismaOrganizationRequiredDocumentRepository.js";
import { PrismaPatientRepository } from "../../patients/infrastructure/prisma/PrismaPatientRepository.js";
import { PrismaPatientPrescriptionRepository } from "../../prescriptions/infrastructure/prisma/PrismaPatientPrescriptionRepository.js";
import { PrismaAuthenticatedUserContextRepository } from "../../users/infrastructure/prisma/PrismaAuthenticatedUserContextRepository.js";
import { PrismaUserRepository } from "../../users/infrastructure/prisma/PrismaUserRepository.js";
import { AuthenticateUserUseCase } from "../application/use-cases/AuthenticateUserUseCase.js";
import { GetMeUseCase } from "../application/use-cases/GetMeUseCase.js";

export interface AuthUseCases {
  authenticateUserUseCase: AuthenticateUserUseCase;
  getMeUseCase: GetMeUseCase;
}

export function makeAuthUseCases(prisma: PrismaService): AuthUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const userRepository = new PrismaUserRepository(transactionManager);
  const contextRepository = new PrismaAuthenticatedUserContextRepository(transactionManager);
  const patientRepository = new PrismaPatientRepository(transactionManager);
  const prescriptionRepository = new PrismaPatientPrescriptionRepository(transactionManager);
  const requiredDocumentRepository = new PrismaOrganizationRequiredDocumentRepository(
    transactionManager,
  );
  const approvalRepository = new PrismaOrganizationDocumentPatientApprovalRepository(
    transactionManager,
  );
  const hashService = new Argon2HashService();
  const jwtService = new JoseJwtService({
    secret: env.JWT_SECRET,
    expiresInSeconds: env.JWT_EXPIRES_IN_SECONDS,
  });

  const refreshPatientRegistrationStatusUseCase = new RefreshPatientRegistrationStatusUseCase({
    patientRepository,
    prescriptionRepository,
    requiredDocumentRepository,
    approvalRepository,
    unitOfWork: transactionManager,
  });

  return {
    authenticateUserUseCase: new AuthenticateUserUseCase({
      userRepository,
      contextRepository,
      hashService,
      jwtService,
    }),
    getMeUseCase: new GetMeUseCase({
      userRepository,
      contextRepository,
      patientStatusRefresher: refreshPatientRegistrationStatusUseCase,
    }),
  };
}

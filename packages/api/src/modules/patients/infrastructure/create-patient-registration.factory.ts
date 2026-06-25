import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { Argon2HashService } from "../../../shared/infrastructure/cryptography/Argon2HashService.js";
import { PrismaUserRepository } from "../../users/infrastructure/prisma/PrismaUserRepository.js";
import { PrismaGuardianRepository } from "../../guardians/infrastructure/prisma/PrismaGuardianRepository.js";
import { PrismaOrganizationRepository } from "../../organizations/infrastructure/prisma/PrismaOrganizationRepository.js";
import { PrismaPatientRepository } from "./prisma/PrismaPatientRepository.js";
import { CreatePatientRegistrationUseCase } from "../application/use-cases/CreatePatientRegistrationUseCase.js";

/**
 * Composition root for the patient-registration use case: wires the Prisma
 * repositories, the Argon2 hash service (via the `HashService` port) and the
 * Prisma-backed unit of work. No HTTP/controller wiring here — that belongs to
 * a later step.
 */
export function makeCreatePatientRegistrationUseCase(
  prisma: PrismaService,
): CreatePatientRegistrationUseCase {
  const transactionManager = new PrismaTransactionManager(prisma);

  return new CreatePatientRegistrationUseCase({
    organizationRepository: new PrismaOrganizationRepository(transactionManager),
    userRepository: new PrismaUserRepository(transactionManager),
    guardianRepository: new PrismaGuardianRepository(transactionManager),
    patientRepository: new PrismaPatientRepository(transactionManager),
    hashService: new Argon2HashService(),
    unitOfWork: transactionManager,
  });
}

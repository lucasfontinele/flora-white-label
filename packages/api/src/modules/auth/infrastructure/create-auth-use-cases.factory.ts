import { env } from "../../../config/env.js";
import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { Argon2HashService } from "../../../shared/infrastructure/cryptography/Argon2HashService.js";
import { JoseJwtService } from "../../../shared/infrastructure/tokens/JoseJwtService.js";
import { PrismaAuthenticatedUserContextRepository } from "../../users/infrastructure/prisma/PrismaAuthenticatedUserContextRepository.js";
import { PrismaUserRepository } from "../../users/infrastructure/prisma/PrismaUserRepository.js";
import { AuthenticateUserUseCase } from "../application/use-cases/AuthenticateUserUseCase.js";

export interface AuthUseCases {
  authenticateUserUseCase: AuthenticateUserUseCase;
}

export function makeAuthUseCases(prisma: PrismaService): AuthUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const userRepository = new PrismaUserRepository(transactionManager);
  const contextRepository = new PrismaAuthenticatedUserContextRepository(transactionManager);
  const hashService = new Argon2HashService();
  const jwtService = new JoseJwtService({
    secret: env.JWT_SECRET,
    expiresInSeconds: env.JWT_EXPIRES_IN_SECONDS,
  });

  return {
    authenticateUserUseCase: new AuthenticateUserUseCase({
      userRepository,
      contextRepository,
      hashService,
      jwtService,
    }),
  };
}

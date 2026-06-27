import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { PrismaPatientRepository } from "../../patients/infrastructure/prisma/PrismaPatientRepository.js";
import { CreatePrescriberUseCase } from "../application/use-cases/CreatePrescriberUseCase.js";
import { DeletePrescriberUseCase } from "../application/use-cases/DeletePrescriberUseCase.js";
import { ListPrescribersByPatientUseCase } from "../application/use-cases/ListPrescribersByPatientUseCase.js";
import { UpdatePrescriberUseCase } from "../application/use-cases/UpdatePrescriberUseCase.js";
import { PrismaPrescriberRepository } from "./prisma/PrismaPrescriberRepository.js";

export interface PrescriberUseCases {
  listPrescribersByPatientUseCase: ListPrescribersByPatientUseCase;
  createPrescriberUseCase: CreatePrescriberUseCase;
  updatePrescriberUseCase: UpdatePrescriberUseCase;
  deletePrescriberUseCase: DeletePrescriberUseCase;
}

export function makePrescriberUseCases(prisma: PrismaService): PrescriberUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const patientRepository = new PrismaPatientRepository(transactionManager);
  const prescriberRepository = new PrismaPrescriberRepository(transactionManager);

  return {
    listPrescribersByPatientUseCase: new ListPrescribersByPatientUseCase(prescriberRepository),
    createPrescriberUseCase: new CreatePrescriberUseCase({
      patientRepository,
      prescriberRepository,
      unitOfWork: transactionManager,
    }),
    updatePrescriberUseCase: new UpdatePrescriberUseCase({
      prescriberRepository,
      unitOfWork: transactionManager,
    }),
    deletePrescriberUseCase: new DeletePrescriberUseCase({
      prescriberRepository,
      unitOfWork: transactionManager,
    }),
  };
}

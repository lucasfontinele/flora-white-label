import type { PrismaService } from "../../../shared/infrastructure/database/prisma/PrismaService.js";
import { PrismaTransactionManager } from "../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import { CreateSubscriptionPlanUseCase } from "../application/use-cases/CreateSubscriptionPlanUseCase.js";
import { DeleteSubscriptionPlanUseCase } from "../application/use-cases/DeleteSubscriptionPlanUseCase.js";
import { GetSubscriptionPlanByIdUseCase } from "../application/use-cases/GetSubscriptionPlanByIdUseCase.js";
import { ListSubscriptionPlansUseCase } from "../application/use-cases/ListSubscriptionPlansUseCase.js";
import { UpdateSubscriptionPlanUseCase } from "../application/use-cases/UpdateSubscriptionPlanUseCase.js";
import { PrismaSubscriptionPlanRepository } from "./prisma/PrismaSubscriptionPlanRepository.js";

export interface SubscriptionPlanUseCases {
  createSubscriptionPlanUseCase: CreateSubscriptionPlanUseCase;
  listSubscriptionPlansUseCase: ListSubscriptionPlansUseCase;
  getSubscriptionPlanByIdUseCase: GetSubscriptionPlanByIdUseCase;
  updateSubscriptionPlanUseCase: UpdateSubscriptionPlanUseCase;
  deleteSubscriptionPlanUseCase: DeleteSubscriptionPlanUseCase;
}

/**
 * Composition root for the subscription-plan CRUD use cases.
 */
export function makeSubscriptionPlanUseCases(prisma: PrismaService): SubscriptionPlanUseCases {
  const transactionManager = new PrismaTransactionManager(prisma);
  const subscriptionPlanRepository = new PrismaSubscriptionPlanRepository(transactionManager);

  return {
    createSubscriptionPlanUseCase: new CreateSubscriptionPlanUseCase({
      subscriptionPlanRepository,
      unitOfWork: transactionManager,
    }),
    listSubscriptionPlansUseCase: new ListSubscriptionPlansUseCase(subscriptionPlanRepository),
    getSubscriptionPlanByIdUseCase: new GetSubscriptionPlanByIdUseCase(subscriptionPlanRepository),
    updateSubscriptionPlanUseCase: new UpdateSubscriptionPlanUseCase({
      subscriptionPlanRepository,
      unitOfWork: transactionManager,
    }),
    deleteSubscriptionPlanUseCase: new DeleteSubscriptionPlanUseCase({
      subscriptionPlanRepository,
      unitOfWork: transactionManager,
    }),
  };
}

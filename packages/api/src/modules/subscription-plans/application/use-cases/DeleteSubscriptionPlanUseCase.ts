import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { SubscriptionPlanRepository } from "../repositories/SubscriptionPlanRepository.js";

export interface DeleteSubscriptionPlanInput {
  id: string;
}

export interface DeleteSubscriptionPlanDependencies {
  subscriptionPlanRepository: SubscriptionPlanRepository;
  unitOfWork: UnitOfWork;
}

export class DeleteSubscriptionPlanUseCase {
  constructor(private readonly deps: DeleteSubscriptionPlanDependencies) {}

  async execute(input: DeleteSubscriptionPlanInput): Promise<void> {
    await this.deps.unitOfWork.execute(async () => {
      const plan = await this.deps.subscriptionPlanRepository.findById(input.id);

      if (!plan) {
        throw new NotFoundError(`Subscription plan "${input.id}" was not found.`);
      }

      if (await this.deps.subscriptionPlanRepository.hasOrganizations(input.id)) {
        throw new ConflictError(`Subscription plan "${input.id}" is used by organizations.`);
      }

      await this.deps.subscriptionPlanRepository.delete(input.id);
    });
  }
}

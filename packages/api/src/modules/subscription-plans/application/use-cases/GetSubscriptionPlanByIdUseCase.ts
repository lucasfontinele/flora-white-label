import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type {
  SubscriptionPlanReadModel,
  SubscriptionPlanRepository,
} from "../repositories/SubscriptionPlanRepository.js";

export interface GetSubscriptionPlanByIdInput {
  id: string;
}

export class GetSubscriptionPlanByIdUseCase {
  constructor(private readonly subscriptionPlanRepository: SubscriptionPlanRepository) {}

  async execute(input: GetSubscriptionPlanByIdInput): Promise<SubscriptionPlanReadModel> {
    const plan = await this.subscriptionPlanRepository.findDetailsById(input.id);

    if (!plan) {
      throw new NotFoundError(`Subscription plan "${input.id}" was not found.`);
    }

    return plan;
  }
}

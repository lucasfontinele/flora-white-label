import type {
  SubscriptionPlanReadModel,
  SubscriptionPlanRepository,
} from "../repositories/SubscriptionPlanRepository.js";

export interface ListSubscriptionPlansOutput {
  data: SubscriptionPlanReadModel[];
}

export class ListSubscriptionPlansUseCase {
  constructor(private readonly subscriptionPlanRepository: SubscriptionPlanRepository) {}

  async execute(): Promise<ListSubscriptionPlansOutput> {
    const data = await this.subscriptionPlanRepository.findAllDetails();

    return { data };
  }
}

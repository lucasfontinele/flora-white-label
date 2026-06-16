import type { ListSubscriptionPlansResponse } from "@flora/shared/organizations";
import type { MasterUserContext } from "../../communication/http/plugins/master-auth.js";
import type { SubscriptionPlanRepository } from "./subscription-plan-repository.js";

export class ListSubscriptionPlansUseCase {
  constructor(private readonly subscriptionPlanRepository: SubscriptionPlanRepository) {}

  async execute(_masterUser: MasterUserContext): Promise<ListSubscriptionPlansResponse> {
    const plans = await this.subscriptionPlanRepository.list();

    return {
      data: plans,
    };
  }
}

import type { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";

export interface SubscriptionPlanRepository {
  findById(id: string): Promise<SubscriptionPlan | null>;
}

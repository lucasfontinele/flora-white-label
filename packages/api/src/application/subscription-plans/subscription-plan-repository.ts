import type { SubscriptionPlan } from "../../domain/subscription-plans/subscription-plan.js";

export type SubscriptionPlanRepository = {
  findById(id: string): Promise<SubscriptionPlan | null>;
  list(): Promise<SubscriptionPlan[]>;
};

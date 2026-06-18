import type { SubscriptionPlanReadModel } from "../../application/repositories/SubscriptionPlanRepository.js";

export interface SubscriptionPlanResponse {
  id: string;
  title: string;
  description: string | null;
  priceInCents: number;
  operatorsLimit: number;
  patientsLimit: number;
  unlimitedOperators: boolean;
  createdAt: string;
  updatedAt: string;
}

export class SubscriptionPlanPresenter {
  static toHttp(plan: SubscriptionPlanReadModel): SubscriptionPlanResponse {
    return {
      id: plan.id,
      title: plan.title,
      description: plan.description,
      priceInCents: plan.priceInCents,
      operatorsLimit: plan.operatorsLimit,
      patientsLimit: plan.patientsLimit,
      unlimitedOperators: plan.unlimitedOperators,
      createdAt: plan.createdAt.toISOString(),
      updatedAt: plan.updatedAt.toISOString(),
    };
  }
}

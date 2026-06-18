import type { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";

export interface SubscriptionPlanReadModel {
  id: string;
  title: string;
  description: string | null;
  priceInCents: number;
  operatorsLimit: number;
  patientsLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlanRepository {
  findById(id: string): Promise<SubscriptionPlan | null>;
  findDetailsById(id: string): Promise<SubscriptionPlanReadModel | null>;
  findAllDetails(): Promise<SubscriptionPlanReadModel[]>;
  create(plan: SubscriptionPlan): Promise<SubscriptionPlanReadModel>;
  save(plan: SubscriptionPlan): Promise<SubscriptionPlanReadModel>;
  delete(id: string): Promise<void>;
  hasOrganizations(id: string): Promise<boolean>;
}

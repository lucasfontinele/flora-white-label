import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type {
  SubscriptionPlanReadModel,
  SubscriptionPlanRepository,
} from "../repositories/SubscriptionPlanRepository.js";
import type { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";
import { GetSubscriptionPlanByIdUseCase } from "./GetSubscriptionPlanByIdUseCase.js";

class InMemorySubscriptionPlanRepository implements SubscriptionPlanRepository {
  constructor(private readonly plans: SubscriptionPlanReadModel[]) {}

  async findById(): Promise<SubscriptionPlan | null> {
    throw new Error("Method not implemented.");
  }

  async findDetailsById(id: string): Promise<SubscriptionPlanReadModel | null> {
    return this.plans.find((plan) => plan.id === id) ?? null;
  }

  async findAllDetails(): Promise<SubscriptionPlanReadModel[]> {
    throw new Error("Method not implemented.");
  }

  async create(): Promise<SubscriptionPlanReadModel> {
    throw new Error("Method not implemented.");
  }

  async save(): Promise<SubscriptionPlanReadModel> {
    throw new Error("Method not implemented.");
  }

  async delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async hasOrganizations(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}

const plan: SubscriptionPlanReadModel = {
  id: "plan-1",
  title: "Plano Essencial",
  description: null,
  priceInCents: 15000,
  operatorsLimit: 5,
  patientsLimit: 100,
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  updatedAt: new Date("2026-06-18T12:00:00.000Z"),
};

describe("GetSubscriptionPlanByIdUseCase", () => {
  it("returns the subscription plan when it exists", async () => {
    const useCase = new GetSubscriptionPlanByIdUseCase(
      new InMemorySubscriptionPlanRepository([plan]),
    );

    await expect(useCase.execute({ id: "plan-1" })).resolves.toEqual(plan);
  });

  it("throws NotFoundError when the subscription plan does not exist", async () => {
    const useCase = new GetSubscriptionPlanByIdUseCase(
      new InMemorySubscriptionPlanRepository([]),
    );

    await expect(useCase.execute({ id: "missing-plan" })).rejects.toBeInstanceOf(NotFoundError);
  });
});

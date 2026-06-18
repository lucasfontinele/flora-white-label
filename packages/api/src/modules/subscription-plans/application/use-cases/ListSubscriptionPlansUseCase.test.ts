import { describe, expect, it } from "vitest";
import type {
  SubscriptionPlanReadModel,
  SubscriptionPlanRepository,
} from "../repositories/SubscriptionPlanRepository.js";
import type { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";
import { ListSubscriptionPlansUseCase } from "./ListSubscriptionPlansUseCase.js";

class InMemorySubscriptionPlanRepository implements SubscriptionPlanRepository {
  constructor(private readonly plans: SubscriptionPlanReadModel[]) {}

  async findById(): Promise<SubscriptionPlan | null> {
    throw new Error("Method not implemented.");
  }

  async findDetailsById(): Promise<SubscriptionPlanReadModel | null> {
    throw new Error("Method not implemented.");
  }

  async findAllDetails(): Promise<SubscriptionPlanReadModel[]> {
    return this.plans;
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

const now = new Date("2026-06-18T12:00:00.000Z");

function makePlan(overrides: Partial<SubscriptionPlanReadModel> = {}): SubscriptionPlanReadModel {
  return {
    id: "plan-1",
    title: "Plano Essencial",
    description: null,
    priceInCents: 15000,
    operatorsLimit: 5,
    patientsLimit: 100,
    unlimitedOperators: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("ListSubscriptionPlansUseCase", () => {
  it("returns all subscription plan read models", async () => {
    const repository = new InMemorySubscriptionPlanRepository([
      makePlan(),
      makePlan({ id: "plan-2", priceInCents: 29900 }),
    ]);
    const useCase = new ListSubscriptionPlansUseCase(repository);

    await expect(useCase.execute()).resolves.toEqual({
      data: [makePlan(), makePlan({ id: "plan-2", priceInCents: 29900 })],
    });
  });

  it("returns an empty data array when no plans exist", async () => {
    const repository = new InMemorySubscriptionPlanRepository([]);
    const useCase = new ListSubscriptionPlansUseCase(repository);

    await expect(useCase.execute()).resolves.toEqual({ data: [] });
  });
});

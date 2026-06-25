import { describe, expect, it } from "vitest";
import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type {
  SubscriptionPlanReadModel,
  SubscriptionPlanRepository,
} from "../repositories/SubscriptionPlanRepository.js";
import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";
import { DeleteSubscriptionPlanUseCase } from "./DeleteSubscriptionPlanUseCase.js";

class InMemorySubscriptionPlanRepository implements SubscriptionPlanRepository {
  readonly plans = new Map<string, SubscriptionPlan>();
  readonly usedPlanIds = new Set<string>();
  deleteCalls = 0;

  constructor(plans: SubscriptionPlan[]) {
    for (const plan of plans) {
      this.plans.set(plan.id, plan);
    }
  }

  async findById(id: string): Promise<SubscriptionPlan | null> {
    return this.plans.get(id) ?? null;
  }

  async findDetailsById(): Promise<SubscriptionPlanReadModel | null> {
    throw new Error("Method not implemented.");
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

  async delete(id: string): Promise<void> {
    this.deleteCalls += 1;
    this.plans.delete(id);
  }

  async hasOrganizations(id: string): Promise<boolean> {
    return this.usedPlanIds.has(id);
  }
}

const immediateUnitOfWork = {
  execute: <T>(work: () => Promise<T>) => work(),
};

function makePlan(id = "plan-1"): SubscriptionPlan {
  return SubscriptionPlan.create(
    {
      title: "Plano Essencial",
      price: MoneyInCents.create(15000),
      operatorsLimit: 5,
      patientsLimit: 100,
    },
    id,
  );
}

function makeSut() {
  const repository = new InMemorySubscriptionPlanRepository([makePlan()]);
  const useCase = new DeleteSubscriptionPlanUseCase({
    subscriptionPlanRepository: repository,
    unitOfWork: immediateUnitOfWork,
  });

  return { repository, useCase };
}

describe("DeleteSubscriptionPlanUseCase", () => {
  it("deletes an existing unused subscription plan", async () => {
    const { repository, useCase } = makeSut();

    await useCase.execute({ id: "plan-1" });

    expect(repository.deleteCalls).toBe(1);
    expect(repository.plans.has("plan-1")).toBe(false);
  });

  it("throws NotFoundError when the subscription plan does not exist", async () => {
    const { repository, useCase } = makeSut();

    await expect(useCase.execute({ id: "missing-plan" })).rejects.toBeInstanceOf(NotFoundError);

    expect(repository.deleteCalls).toBe(0);
  });

  it("throws ConflictError and keeps the plan when organizations use it", async () => {
    const { repository, useCase } = makeSut();
    repository.usedPlanIds.add("plan-1");

    await expect(useCase.execute({ id: "plan-1" })).rejects.toBeInstanceOf(ConflictError);

    expect(repository.deleteCalls).toBe(0);
    expect(repository.plans.has("plan-1")).toBe(true);
  });
});

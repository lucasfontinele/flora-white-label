import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type {
  SubscriptionPlanReadModel,
  SubscriptionPlanRepository,
} from "../repositories/SubscriptionPlanRepository.js";
import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";
import { UpdateSubscriptionPlanUseCase } from "./UpdateSubscriptionPlanUseCase.js";

class InMemorySubscriptionPlanRepository implements SubscriptionPlanRepository {
  readonly plans = new Map<string, SubscriptionPlanReadModel>();
  saveCalls = 0;

  constructor(plans: SubscriptionPlanReadModel[]) {
    for (const plan of plans) {
      this.plans.set(plan.id, plan);
    }
  }

  async findById(id: string): Promise<SubscriptionPlan | null> {
    const plan = this.plans.get(id);

    if (!plan) {
      return null;
    }

    return SubscriptionPlan.create(
      {
        title: plan.title,
        description: plan.description ?? undefined,
        price: MoneyInCents.create(plan.priceInCents),
        operatorsLimit: plan.operatorsLimit,
        patientsLimit: plan.patientsLimit,
        unlimitedOperators: plan.unlimitedOperators,
      },
      plan.id,
    );
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

  async save(plan: SubscriptionPlan): Promise<SubscriptionPlanReadModel> {
    this.saveCalls += 1;

    const current = this.plans.get(plan.id);
    if (!current) {
      throw new Error("Cannot save missing plan.");
    }

    const saved = {
      id: plan.id,
      title: plan.title,
      description: plan.description ?? null,
      priceInCents: plan.priceInCents,
      operatorsLimit: plan.operatorsLimit,
      patientsLimit: plan.patientsLimit,
      unlimitedOperators: plan.unlimitedOperators,
      createdAt: current.createdAt,
      updatedAt: new Date("2026-06-18T13:00:00.000Z"),
    };

    this.plans.set(plan.id, saved);

    return saved;
  }

  async delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async hasOrganizations(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}

const now = new Date("2026-06-18T12:00:00.000Z");
const existingPlan: SubscriptionPlanReadModel = {
  id: "plan-1",
  title: "Plano Essencial",
  description: "Plano inicial",
  priceInCents: 15000,
  operatorsLimit: 5,
  patientsLimit: 100,
  unlimitedOperators: false,
  createdAt: now,
  updatedAt: now,
};

const immediateUnitOfWork = {
  execute: <T>(work: () => Promise<T>) => work(),
};

function makeSut() {
  const repository = new InMemorySubscriptionPlanRepository([existingPlan]);
  const useCase = new UpdateSubscriptionPlanUseCase({
    subscriptionPlanRepository: repository,
    unitOfWork: immediateUnitOfWork,
  });

  return { repository, useCase };
}

describe("UpdateSubscriptionPlanUseCase", () => {
  it("fully updates an existing subscription plan", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      id: "plan-1",
      title: "Plano Profissional",
      description: "Plano atualizado",
      priceInCents: 29900,
      operatorsLimit: 10,
      patientsLimit: 300,
    });

    expect(output).toMatchObject({
      id: "plan-1",
      title: "Plano Profissional",
      description: "Plano atualizado",
      priceInCents: 29900,
      operatorsLimit: 10,
      patientsLimit: 300,
    });
    expect(output.updatedAt).toEqual(new Date("2026-06-18T13:00:00.000Z"));
  });

  it("stores null description when description is null", async () => {
    const { useCase } = makeSut();

    const output = await useCase.execute({
      id: "plan-1",
      title: "Plano Profissional",
      description: null,
      priceInCents: 29900,
      operatorsLimit: 10,
      patientsLimit: 300,
    });

    expect(output.description).toBeNull();
  });

  it("throws NotFoundError when the subscription plan does not exist", async () => {
    const { repository, useCase } = makeSut();

    await expect(
      useCase.execute({
        id: "missing-plan",
        title: "Plano Profissional",
        priceInCents: 29900,
        operatorsLimit: 10,
        patientsLimit: 300,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(repository.saveCalls).toBe(0);
  });

  it("does not save invalid update data", async () => {
    const { repository, useCase } = makeSut();

    await expect(
      useCase.execute({
        id: "plan-1",
        title: " ",
        priceInCents: 29900,
        operatorsLimit: 10,
        patientsLimit: 300,
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);

    expect(repository.saveCalls).toBe(0);
    expect(repository.plans.get("plan-1")).toEqual(existingPlan);
  });
});

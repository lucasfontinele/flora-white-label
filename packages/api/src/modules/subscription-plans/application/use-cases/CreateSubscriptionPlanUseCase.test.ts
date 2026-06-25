import { describe, expect, it } from "vitest";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type {
  SubscriptionPlanReadModel,
  SubscriptionPlanRepository,
} from "../repositories/SubscriptionPlanRepository.js";
import type { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";
import { CreateSubscriptionPlanUseCase } from "./CreateSubscriptionPlanUseCase.js";

class InMemorySubscriptionPlanRepository implements SubscriptionPlanRepository {
  readonly plans = new Map<string, SubscriptionPlanReadModel>();

  async findById(): Promise<SubscriptionPlan | null> {
    throw new Error("Method not implemented.");
  }

  async findDetailsById(): Promise<SubscriptionPlanReadModel | null> {
    throw new Error("Method not implemented.");
  }

  async findAllDetails(): Promise<SubscriptionPlanReadModel[]> {
    throw new Error("Method not implemented.");
  }

  async create(plan: SubscriptionPlan): Promise<SubscriptionPlanReadModel> {
    const now = new Date("2026-06-18T12:00:00.000Z");
    const readModel = {
      id: plan.id,
      title: plan.title,
      description: plan.description ?? null,
      priceInCents: plan.priceInCents,
      operatorsLimit: plan.operatorsLimit,
      patientsLimit: plan.patientsLimit,
      unlimitedOperators: plan.unlimitedOperators,
      createdAt: now,
      updatedAt: now,
    };

    this.plans.set(readModel.id, readModel);

    return readModel;
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

const immediateUnitOfWork = {
  execute: <T>(work: () => Promise<T>) => work(),
};

function makeSut() {
  const repository = new InMemorySubscriptionPlanRepository();
  const useCase = new CreateSubscriptionPlanUseCase({
    subscriptionPlanRepository: repository,
    unitOfWork: immediateUnitOfWork,
  });

  return { repository, useCase };
}

describe("CreateSubscriptionPlanUseCase", () => {
  it("creates a subscription plan and returns a read model", async () => {
    const { repository, useCase } = makeSut();

    const output = await useCase.execute({
      title: "  Plano Essencial  ",
      description: "  Ideal para associacoes iniciantes.  ",
      priceInCents: 15000,
      operatorsLimit: 5,
      patientsLimit: 100,
    });

    expect(output.id).toEqual(expect.any(String));
    expect(output.title).toBe("Plano Essencial");
    expect(output.description).toBe("Ideal para associacoes iniciantes.");
    expect(output.priceInCents).toBe(15000);
    expect(output.operatorsLimit).toBe(5);
    expect(output.patientsLimit).toBe(100);
    expect(output.createdAt).toBeInstanceOf(Date);
    expect(output.updatedAt).toBeInstanceOf(Date);
    expect(repository.plans.size).toBe(1);
  });

  it("stores omitted and null descriptions as null in the read model", async () => {
    const { useCase } = makeSut();

    const omittedDescription = await useCase.execute({
      title: "Plano Essencial",
      priceInCents: 15000,
      operatorsLimit: 5,
      patientsLimit: 100,
    });
    const nullDescription = await useCase.execute({
      title: "Plano Profissional",
      description: null,
      priceInCents: 29900,
      operatorsLimit: 10,
      patientsLimit: 300,
    });

    expect(omittedDescription.description).toBeNull();
    expect(nullDescription.description).toBeNull();
  });

  it("defaults unlimitedOperators to false and stores it when true", async () => {
    const { useCase } = makeSut();

    const defaulted = await useCase.execute({
      title: "Plano Essencial",
      priceInCents: 15000,
      operatorsLimit: 5,
      patientsLimit: 100,
    });
    const unlimited = await useCase.execute({
      title: "Plano Ilimitado",
      priceInCents: 49900,
      operatorsLimit: 1,
      patientsLimit: 1000,
      unlimitedOperators: true,
    });

    expect(defaulted.unlimitedOperators).toBe(false);
    expect(unlimited.unlimitedOperators).toBe(true);
  });

  it("rejects invalid title, money, and limits before persistence", async () => {
    const { repository, useCase } = makeSut();

    await expect(
      useCase.execute({
        title: " ",
        priceInCents: 15000,
        operatorsLimit: 5,
        patientsLimit: 100,
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    await expect(
      useCase.execute({
        title: "Plano Essencial",
        priceInCents: 10.5,
        operatorsLimit: 5,
        patientsLimit: 100,
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
    await expect(
      useCase.execute({
        title: "Plano Essencial",
        priceInCents: 15000,
        operatorsLimit: 0,
        patientsLimit: 100,
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);

    expect(repository.plans.size).toBe(0);
  });
});

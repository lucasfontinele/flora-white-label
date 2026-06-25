import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";
import type {
  SubscriptionPlanReadModel,
  SubscriptionPlanRepository,
} from "../repositories/SubscriptionPlanRepository.js";

export interface CreateSubscriptionPlanInput {
  title: string;
  description?: string | null;
  priceInCents: number;
  operatorsLimit: number;
  patientsLimit: number;
  unlimitedOperators?: boolean;
}

export interface CreateSubscriptionPlanDependencies {
  subscriptionPlanRepository: SubscriptionPlanRepository;
  unitOfWork: UnitOfWork;
}

export class CreateSubscriptionPlanUseCase {
  constructor(private readonly deps: CreateSubscriptionPlanDependencies) {}

  async execute(input: CreateSubscriptionPlanInput): Promise<SubscriptionPlanReadModel> {
    const plan = SubscriptionPlan.create({
      title: input.title,
      description: input.description ?? undefined,
      price: MoneyInCents.create(input.priceInCents),
      operatorsLimit: input.operatorsLimit,
      patientsLimit: input.patientsLimit,
      unlimitedOperators: input.unlimitedOperators,
    });

    return this.deps.unitOfWork.execute(() => this.deps.subscriptionPlanRepository.create(plan));
  }
}

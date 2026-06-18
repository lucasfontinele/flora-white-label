import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";
import type {
  SubscriptionPlanReadModel,
  SubscriptionPlanRepository,
} from "../repositories/SubscriptionPlanRepository.js";

export interface UpdateSubscriptionPlanInput {
  id: string;
  title: string;
  description?: string | null;
  priceInCents: number;
  operatorsLimit: number;
  patientsLimit: number;
}

export interface UpdateSubscriptionPlanDependencies {
  subscriptionPlanRepository: SubscriptionPlanRepository;
  unitOfWork: UnitOfWork;
}

export class UpdateSubscriptionPlanUseCase {
  constructor(private readonly deps: UpdateSubscriptionPlanDependencies) {}

  async execute(input: UpdateSubscriptionPlanInput): Promise<SubscriptionPlanReadModel> {
    return this.deps.unitOfWork.execute(async () => {
      const existingPlan = await this.deps.subscriptionPlanRepository.findById(input.id);

      if (!existingPlan) {
        throw new NotFoundError(`Subscription plan "${input.id}" was not found.`);
      }

      const plan = SubscriptionPlan.create(
        {
          title: input.title,
          description: input.description ?? undefined,
          price: MoneyInCents.create(input.priceInCents),
          operatorsLimit: input.operatorsLimit,
          patientsLimit: input.patientsLimit,
        },
        existingPlan.id,
      );

      return this.deps.subscriptionPlanRepository.save(plan);
    });
  }
}

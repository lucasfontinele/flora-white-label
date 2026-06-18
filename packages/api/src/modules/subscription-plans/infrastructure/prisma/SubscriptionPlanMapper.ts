import type { Prisma, SubscriptionPlan as PrismaSubscriptionPlan } from "@prisma/client";
import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";

export class SubscriptionPlanMapper {
  static toDomain(record: PrismaSubscriptionPlan): SubscriptionPlan {
    return SubscriptionPlan.create(
      {
        title: record.title,
        description: record.description,
        price: MoneyInCents.create(record.priceInCents),
        operatorsLimit: record.operatorsLimit,
        patientsLimit: record.patientsLimit,
      },
      record.id,
    );
  }

  static toPersistence(plan: SubscriptionPlan): Prisma.SubscriptionPlanUncheckedCreateInput {
    return {
      id: plan.id,
      title: plan.title,
      description: plan.description,
      priceInCents: plan.priceInCents,
      operatorsLimit: plan.operatorsLimit,
      patientsLimit: plan.patientsLimit,
    };
  }
}

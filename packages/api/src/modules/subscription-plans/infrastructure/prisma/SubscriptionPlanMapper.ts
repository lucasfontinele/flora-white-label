import type { Prisma, SubscriptionPlan as PrismaSubscriptionPlan } from "@prisma/client";
import type { SubscriptionPlanReadModel } from "../../application/repositories/SubscriptionPlanRepository.js";
import { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";

export class SubscriptionPlanMapper {
  static toDomain(record: PrismaSubscriptionPlan): SubscriptionPlan {
    return SubscriptionPlan.create(
      {
        title: record.title,
        description: record.description ?? undefined,
        price: MoneyInCents.create(record.priceInCents),
        operatorsLimit: record.operatorsLimit,
        patientsLimit: record.patientsLimit,
        unlimitedOperators: record.unlimitedOperators,
      },
      record.id,
    );
  }

  static toReadModel(record: PrismaSubscriptionPlan): SubscriptionPlanReadModel {
    return {
      id: record.id,
      title: record.title,
      description: record.description ?? null,
      priceInCents: record.priceInCents,
      operatorsLimit: record.operatorsLimit,
      patientsLimit: record.patientsLimit,
      unlimitedOperators: record.unlimitedOperators,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toPersistence(plan: SubscriptionPlan): Prisma.SubscriptionPlanUncheckedCreateInput {
    return {
      id: plan.id,
      title: plan.title,
      description: plan.description ?? null,
      priceInCents: plan.priceInCents,
      operatorsLimit: plan.operatorsLimit,
      patientsLimit: plan.patientsLimit,
      unlimitedOperators: plan.unlimitedOperators,
    };
  }

  static toUpdatePersistence(plan: SubscriptionPlan): Prisma.SubscriptionPlanUncheckedUpdateInput {
    return {
      title: plan.title,
      description: plan.description ?? null,
      priceInCents: plan.priceInCents,
      operatorsLimit: plan.operatorsLimit,
      patientsLimit: plan.patientsLimit,
      unlimitedOperators: plan.unlimitedOperators,
    };
  }
}

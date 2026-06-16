import type { PrismaClient } from "@prisma/client";
import type { SubscriptionPlan } from "../../domain/subscription-plans/subscription-plan.js";
import { prisma as defaultPrisma } from "./prisma-client.js";

export class PrismaSubscriptionPlanRepository {
  constructor(private readonly client: PrismaClient = defaultPrisma) {}

  async findById(id: string): Promise<SubscriptionPlan | null> {
    const plan = await this.client.subscriptionPlan.findUnique({
      where: { id },
    });

    return plan ? mapPlan(plan) : null;
  }

  async list(): Promise<SubscriptionPlan[]> {
    const plans = await this.client.subscriptionPlan.findMany({
      orderBy: { priceInCents: "asc" },
    });

    return plans.map(mapPlan);
  }
}

function mapPlan(plan: {
  code: string;
  id: string;
  maxActiveUsers: number;
  maxOperators: number | null;
  name: string;
  operatorLimitType: string;
  priceInCents: number;
}): SubscriptionPlan {
  return {
    code: plan.code as SubscriptionPlan["code"],
    id: plan.id,
    maxActiveUsers: plan.maxActiveUsers,
    maxOperators: plan.maxOperators,
    name: plan.name as SubscriptionPlan["name"],
    operatorLimitType: plan.operatorLimitType as SubscriptionPlan["operatorLimitType"],
    priceInCents: plan.priceInCents,
  };
}

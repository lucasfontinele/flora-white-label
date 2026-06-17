import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type { SubscriptionPlanRepository } from "../../application/repositories/SubscriptionPlanRepository.js";
import type { SubscriptionPlan } from "../../domain/entities/SubscriptionPlan.js";
import { SubscriptionPlanMapper } from "./SubscriptionPlanMapper.js";

export class PrismaSubscriptionPlanRepository implements SubscriptionPlanRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findById(id: string): Promise<SubscriptionPlan | null> {
    const record = await this.prisma.getClient().subscriptionPlan.findUnique({
      where: { id },
    });

    return record ? SubscriptionPlanMapper.toDomain(record) : null;
  }
}

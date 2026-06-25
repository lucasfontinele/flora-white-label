import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  SubscriptionPlanReadModel,
  SubscriptionPlanRepository,
} from "../../application/repositories/SubscriptionPlanRepository.js";
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

  async findDetailsById(id: string): Promise<SubscriptionPlanReadModel | null> {
    const record = await this.prisma.getClient().subscriptionPlan.findUnique({
      where: { id },
    });

    return record ? SubscriptionPlanMapper.toReadModel(record) : null;
  }

  async findAllDetails(): Promise<SubscriptionPlanReadModel[]> {
    const records = await this.prisma.getClient().subscriptionPlan.findMany({
      orderBy: { createdAt: "asc" },
    });

    return records.map((record) => SubscriptionPlanMapper.toReadModel(record));
  }

  async create(plan: SubscriptionPlan): Promise<SubscriptionPlanReadModel> {
    const record = await this.prisma.getClient().subscriptionPlan.create({
      data: SubscriptionPlanMapper.toPersistence(plan),
    });

    return SubscriptionPlanMapper.toReadModel(record);
  }

  async save(plan: SubscriptionPlan): Promise<SubscriptionPlanReadModel> {
    const record = await this.prisma.getClient().subscriptionPlan.update({
      where: { id: plan.id },
      data: SubscriptionPlanMapper.toUpdatePersistence(plan),
    });

    return SubscriptionPlanMapper.toReadModel(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.getClient().subscriptionPlan.delete({
      where: { id },
    });
  }

  async hasOrganizations(id: string): Promise<boolean> {
    const count = await this.prisma.getClient().organization.count({
      where: { currentPlanId: id },
    });

    return count > 0;
  }
}

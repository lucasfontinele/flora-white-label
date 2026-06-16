import type { FastifyPluginAsync } from "fastify";
import { ListSubscriptionPlansUseCase } from "../../../application/subscription-plans/list-subscription-plans-use-case.js";
import type { SubscriptionPlanRepository } from "../../../application/subscription-plans/subscription-plan-repository.js";
import { PrismaSubscriptionPlanRepository } from "../../../infrastructure/database/prisma-subscription-plan-repository.js";

export type SubscriptionPlansRoutesOptions = {
  subscriptionPlanRepository?: SubscriptionPlanRepository;
};

export function subscriptionPlansRoutes(options: SubscriptionPlansRoutesOptions = {}): FastifyPluginAsync {
  return async (app) => {
    const subscriptionPlanRepository =
      options.subscriptionPlanRepository ?? new PrismaSubscriptionPlanRepository();
    const listSubscriptionPlansUseCase = new ListSubscriptionPlansUseCase(subscriptionPlanRepository);

    app.get("/subscription-plans", async (request) => {
      const masterUser = await request.requireMaster();

      return listSubscriptionPlansUseCase.execute(masterUser);
    });
  };
}

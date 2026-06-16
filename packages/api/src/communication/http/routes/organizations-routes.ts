import type { FastifyPluginAsync } from "fastify";
import { CreateOrganizationUseCase } from "../../../application/organizations/create-organization-use-case.js";
import type { OrganizationRepository } from "../../../application/organizations/organization-repository.js";
import type { SubscriptionPlanRepository } from "../../../application/subscription-plans/subscription-plan-repository.js";
import { PrismaOrganizationRepository } from "../../../infrastructure/database/prisma-organization-repository.js";
import { PrismaSubscriptionPlanRepository } from "../../../infrastructure/database/prisma-subscription-plan-repository.js";

export type OrganizationsRoutesOptions = {
  organizationRepository?: OrganizationRepository;
  subscriptionPlanRepository?: SubscriptionPlanRepository;
};

export function organizationsRoutes(options: OrganizationsRoutesOptions = {}): FastifyPluginAsync {
  return async (app) => {
    const organizationRepository = options.organizationRepository ?? new PrismaOrganizationRepository();
    const subscriptionPlanRepository =
      options.subscriptionPlanRepository ?? new PrismaSubscriptionPlanRepository();
    const createOrganizationUseCase = new CreateOrganizationUseCase(
      organizationRepository,
      subscriptionPlanRepository,
    );

    app.post("/organizations", async (request, reply) => {
      const masterUser = await request.requireMaster();
      const organization = await createOrganizationUseCase.execute(request.body, masterUser);

      return reply.status(201).send({
        data: organization,
      });
    });
  };
}

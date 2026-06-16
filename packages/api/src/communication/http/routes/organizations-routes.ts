import type { FastifyPluginAsync } from "fastify";
import { CreateOrganizationUseCase } from "../../../application/organizations/create-organization-use-case.js";
import { ListOrganizationsUseCase } from "../../../application/organizations/list-organizations-use-case.js";
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
    const listOrganizationsUseCase = new ListOrganizationsUseCase(organizationRepository);

    app.get("/organizations", async (request) => {
      const masterUser = await request.requireMaster();
      const query = request.query as { page?: string; perPage?: string };

      return listOrganizationsUseCase.execute(
        {
          page: parseQueryInteger(query.page),
          perPage: parseQueryInteger(query.perPage),
        },
        masterUser,
      );
    });

    app.post("/organizations", async (request, reply) => {
      const masterUser = await request.requireMaster();
      const organization = await createOrganizationUseCase.execute(request.body, masterUser);

      return reply.status(201).send({
        data: organization,
      });
    });
  };
}

function parseQueryInteger(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : undefined;
}

import type { FastifyInstance, FastifyReply } from "fastify";
import { makeOrganizationOverviewUseCases } from "../../infrastructure/create-organization-overview-use-cases.factory.js";
import {
  errorResponseSchema,
  organizationOverviewParamsJsonSchema,
  organizationOverviewParamsSchema,
  organizationOverviewResponseSchema,
} from "./organization-overview-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function organizationOverviewRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeOrganizationOverviewUseCases(app.prisma);

  app.get(
    "/organizations/:organizationId/overview",
    {
      schema: {
        tags: ["Organization Overview"],
        summary: "Retorna contadores operacionais da organização para a sidebar.",
        params: organizationOverviewParamsJsonSchema,
        response: {
          200: organizationOverviewResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationOverviewParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      return useCases.getOrganizationOverviewUseCase.execute(params.data);
    },
  );
}

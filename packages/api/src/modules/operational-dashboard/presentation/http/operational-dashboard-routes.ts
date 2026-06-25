import type { FastifyInstance, FastifyReply } from "fastify";
import { makeOperationalDashboardUseCases } from "../../infrastructure/create-operational-dashboard-use-cases.factory.js";
import {
  errorResponseSchema,
  operationalDashboardParamsJsonSchema,
  operationalDashboardParamsSchema,
  operationalDashboardQueryJsonSchema,
  operationalDashboardQuerySchema,
  operationalDashboardResponseSchema,
} from "./operational-dashboard-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function operationalDashboardRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeOperationalDashboardUseCases(app.prisma);

  app.get(
    "/organizations/:organizationId/operational-dashboard",
    {
      schema: {
        tags: ["Operational Dashboard"],
        summary: "Visão geral operacional da organização (restrito à diretoria).",
        params: operationalDashboardParamsJsonSchema,
        querystring: operationalDashboardQueryJsonSchema,
        response: {
          200: operationalDashboardResponseSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = operationalDashboardParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const query = operationalDashboardQuerySchema.safeParse(request.query);
      if (!query.success) {
        return sendValidationError(reply, "Invalid request query.");
      }

      const summary = await useCases.getOperationalDashboardUseCase.execute({
        organizationId: params.data.organizationId,
        employeeId: query.data.employeeId,
      });

      return { data: summary };
    },
  );
}

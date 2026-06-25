import type { FastifyInstance, FastifyReply } from "fastify";
import { makeMasterReportsUseCases } from "../../infrastructure/create-master-reports-use-cases.factory.js";
import {
  errorResponseSchema,
  masterReportsHeadersSchema,
  masterReportsQueryJsonSchema,
  masterReportsQuerySchema,
  masterReportsResponseSchema,
} from "./master-reports-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function masterReportsRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeMasterReportsUseCases(app.prisma);

  app.get(
    "/backoffice/reports",
    {
      schema: {
        tags: ["Master Reports"],
        summary: "Relatórios consolidados da rede (restrito a usuários master).",
        querystring: masterReportsQueryJsonSchema,
        response: {
          200: masterReportsResponseSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const query = masterReportsQuerySchema.safeParse(request.query);
      if (!query.success) {
        return sendValidationError(reply, "Invalid request query.");
      }

      const headers = masterReportsHeadersSchema.safeParse(request.headers);
      const requesterUserId = headers.success ? headers.data["x-master-user-id"] ?? "" : "";

      const reports = await useCases.getMasterReportsUseCase.execute({
        requesterUserId,
        organizationIds: query.data.organizationIds,
      });

      return { data: reports };
    },
  );
}

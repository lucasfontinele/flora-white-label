import type { FastifyInstance, FastifyReply } from "fastify";
import { makeUserUseCases } from "../../infrastructure/create-user-use-cases.factory.js";
import type { AssociateReadModel } from "../../application/repositories/OrganizationAssociateRepository.js";
import {
  associateAccessParamsJsonSchema,
  associateAccessParamsSchema,
  associateListResponseSchema,
  errorResponseSchema,
  listAssociatesQueryJsonSchema,
  listAssociatesQuerySchema,
  organizationParamsJsonSchema,
  organizationParamsSchema,
  setUserAccessBodyJsonSchema,
  setUserAccessBodySchema,
  userAccessResponseSchema,
} from "./user-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({ error: "ValidationError", message });
}

function associateToHttp(associate: AssociateReadModel) {
  return {
    userId: associate.userId,
    email: associate.email,
    type: associate.type,
    name: associate.name,
    patientNames: associate.patientNames,
    isActive: associate.isActive,
    createdAt: associate.createdAt.toISOString(),
  };
}

export async function userRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeUserUseCases(app.prisma);

  app.get(
    "/organizations/:organizationId/associates",
    {
      schema: {
        tags: ["Organization Associates"],
        summary: "Lista associados (pacientes responsáveis por si e responsáveis/guardiões).",
        params: organizationParamsJsonSchema,
        querystring: listAssociatesQueryJsonSchema,
        response: {
          200: associateListResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const query = listAssociatesQuerySchema.safeParse(request.query);
      if (!query.success) {
        return sendValidationError(reply, "Invalid request query.");
      }

      const output = await useCases.listOrganizationAssociatesUseCase.execute({
        organizationId: params.data.organizationId,
        search: query.data.search,
        type: query.data.type,
        isActive:
          query.data.status === undefined ? undefined : query.data.status === "active",
      });

      return { data: output.data.map(associateToHttp) };
    },
  );

  app.patch(
    "/organizations/:organizationId/associates/:userId/access",
    {
      schema: {
        tags: ["Organization Associates"],
        summary: "Habilita ou desabilita o acesso (login) de um associado.",
        params: associateAccessParamsJsonSchema,
        body: setUserAccessBodyJsonSchema,
        response: {
          200: userAccessResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = associateAccessParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = setUserAccessBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      return useCases.setUserAccessUseCase.execute({
        organizationId: params.data.organizationId,
        userId: params.data.userId,
        isActive: body.data.isActive,
      });
    },
  );
}

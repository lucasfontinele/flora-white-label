import type { FastifyInstance, FastifyReply } from "fastify";
import { makeOrganizationUseCases } from "../../infrastructure/create-organization-use-cases.factory.js";
import { OrganizationPresenter } from "./organization-presenter.js";
import {
  createOrganizationBodySchema,
  listOrganizationsQueryJsonSchema,
  listOrganizationsQuerySchema,
  organizationListResponseSchema,
  organizationParamsJsonSchema,
  organizationParamsSchema,
  organizationResponseSchema,
  organizationWriteBodyJsonSchema,
  updateOrganizationBodySchema,
  validationErrorResponseSchema,
} from "./organization-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function organizationRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeOrganizationUseCases(app.prisma);

  app.post(
    "/backoffice/organizations",
    {
      schema: {
        tags: ["Organizations"],
        summary: "Cria uma organização com endereço.",
        body: organizationWriteBodyJsonSchema,
        response: {
          201: organizationResponseSchema,
          400: validationErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const body = createOrganizationBodySchema.safeParse(request.body);

      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const organization = await useCases.createOrganizationUseCase.execute(body.data);

      return reply.status(201).send(OrganizationPresenter.toHttp(organization));
    },
  );

  app.get(
    "/backoffice/organizations",
    {
      schema: {
        tags: ["Organizations"],
        summary: "Lista organizações.",
        querystring: listOrganizationsQueryJsonSchema,
        response: {
          200: organizationListResponseSchema,
          400: validationErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const query = listOrganizationsQuerySchema.safeParse(request.query);

      if (!query.success) {
        return sendValidationError(reply, "Invalid request query.");
      }

      const output = await useCases.listOrganizationsUseCase.execute();

      return {
        data: output.data.map((organization) => OrganizationPresenter.toHttp(organization)),
      };
    },
  );

  app.get(
    "/backoffice/organizations/:id",
    {
      schema: {
        tags: ["Organizations"],
        summary: "Busca uma organização pelo ID.",
        params: organizationParamsJsonSchema,
        response: {
          200: organizationResponseSchema,
          400: validationErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationParamsSchema.safeParse(request.params);

      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const organization = await useCases.getOrganizationByIdUseCase.execute(params.data);

      return OrganizationPresenter.toHttp(organization);
    },
  );

  app.put(
    "/backoffice/organizations/:id",
    {
      schema: {
        tags: ["Organizations"],
        summary: "Atualiza uma organização e seu endereço.",
        params: organizationParamsJsonSchema,
        body: organizationWriteBodyJsonSchema,
        response: {
          200: organizationResponseSchema,
          400: validationErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationParamsSchema.safeParse(request.params);

      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = updateOrganizationBodySchema.safeParse(request.body);

      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const organization = await useCases.updateOrganizationUseCase.execute({
        id: params.data.id,
        ...body.data,
      });

      return OrganizationPresenter.toHttp(organization);
    },
  );

  app.delete(
    "/backoffice/organizations/:id",
    {
      schema: {
        tags: ["Organizations"],
        summary: "Remove uma organização.",
        params: organizationParamsJsonSchema,
        response: {
          204: { type: "null" },
          400: validationErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationParamsSchema.safeParse(request.params);

      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      await useCases.deleteOrganizationUseCase.execute(params.data);

      return reply.status(204).send();
    },
  );
}

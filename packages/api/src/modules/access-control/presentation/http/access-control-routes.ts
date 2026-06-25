import type { FastifyInstance, FastifyReply } from "fastify";
import { makeAccessControlUseCases } from "../../infrastructure/create-access-control-use-cases.factory.js";
import { AccessControlPresenter } from "./access-control-presenter.js";
import {
  employeeParamsJsonSchema,
  employeeParamsSchema,
  employeePermissionsResponseSchema,
  errorResponseSchema,
  organizationParamsJsonSchema,
  organizationParamsSchema,
  roleListResponseSchema,
  roleParamsJsonSchema,
  roleParamsSchema,
  roleResponseSchema,
  setRolePermissionsBodyJsonSchema,
  setRolePermissionsBodySchema,
} from "./access-control-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function accessControlRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeAccessControlUseCases(app.prisma);

  app.get(
    "/organizations/:organizationId/roles",
    {
      schema: {
        tags: ["Access Control"],
        summary: "Lista os perfis de acesso da organização com suas permissões.",
        params: organizationParamsJsonSchema,
        response: {
          200: roleListResponseSchema,
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

      const output = await useCases.listOrganizationRolesUseCase.execute(params.data);

      return {
        data: output.data.map((role) => AccessControlPresenter.roleToHttp(role)),
        catalog: output.catalog,
      };
    },
  );

  app.get(
    "/organizations/:organizationId/employees/:employeeId/permissions",
    {
      schema: {
        tags: ["Access Control"],
        summary: "Retorna as permissões efetivas de um funcionário (perfil atribuído).",
        params: employeeParamsJsonSchema,
        response: {
          200: employeePermissionsResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = employeeParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.getEmployeePermissionsUseCase.execute(params.data);

      return AccessControlPresenter.employeePermissionsToHttp(output);
    },
  );

  app.put(
    "/organizations/:organizationId/roles/:roleId/permissions",
    {
      schema: {
        tags: ["Access Control"],
        summary: "Define o conjunto de permissões de um perfil de acesso.",
        params: roleParamsJsonSchema,
        body: setRolePermissionsBodyJsonSchema,
        response: {
          200: roleResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = roleParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = setRolePermissionsBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.setRolePermissionsUseCase.execute({
        organizationId: params.data.organizationId,
        roleId: params.data.roleId,
        permissions: body.data.permissions,
      });

      return AccessControlPresenter.roleToHttp(output);
    },
  );
}

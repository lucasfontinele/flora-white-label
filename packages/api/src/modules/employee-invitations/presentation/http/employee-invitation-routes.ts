import type { FastifyInstance, FastifyReply } from "fastify";
import { makeEmployeeInvitationUseCases } from "../../infrastructure/create-employee-invitation-use-cases.factory.js";
import { EmployeeInvitationPresenter } from "./employee-invitation-presenter.js";
import {
  acceptInvitationBodyJsonSchema,
  acceptInvitationBodySchema,
  acceptInvitationResponseSchema,
  errorResponseSchema,
  invitationListResponseSchema,
  invitationParamsJsonSchema,
  invitationParamsSchema,
  invitationResponseSchema,
  invitationTokenResponseSchema,
  organizationParamsJsonSchema,
  organizationParamsSchema,
  sendInvitationBodyJsonSchema,
  sendInvitationBodySchema,
  tokenParamsJsonSchema,
  tokenParamsSchema,
} from "./employee-invitation-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function employeeInvitationRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeEmployeeInvitationUseCases(app.prisma);

  app.post(
    "/organizations/:organizationId/employee-invitations",
    {
      schema: {
        tags: ["Employee Invitations"],
        summary: "Envia (ou reenvia) um convite de funcionário por e-mail.",
        params: organizationParamsJsonSchema,
        body: sendInvitationBodyJsonSchema,
        response: {
          201: invitationResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = sendInvitationBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.sendEmployeeInvitationUseCase.execute({
        organizationId: params.data.organizationId,
        email: body.data.email,
        roleId: body.data.roleId,
      });

      return reply.status(201).send(EmployeeInvitationPresenter.toHttp(output));
    },
  );

  app.get(
    "/organizations/:organizationId/employee-invitations",
    {
      schema: {
        tags: ["Employee Invitations"],
        summary: "Lista os convites de funcionário da organização.",
        params: organizationParamsJsonSchema,
        response: {
          200: invitationListResponseSchema,
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

      const output = await useCases.listEmployeeInvitationsUseCase.execute(params.data);

      return {
        data: output.data.map((invitation) => EmployeeInvitationPresenter.toHttp(invitation)),
      };
    },
  );

  app.post(
    "/organizations/:organizationId/employee-invitations/:invitationId/resend",
    {
      schema: {
        tags: ["Employee Invitations"],
        summary: "Reenvia um convite existente, gerando um novo link.",
        params: invitationParamsJsonSchema,
        response: {
          200: invitationResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = invitationParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.resendEmployeeInvitationUseCase.execute(params.data);

      return EmployeeInvitationPresenter.toHttp(output);
    },
  );

  // Public routes for the registration screen (the invitee only has the token).
  app.get(
    "/employee-invitations/:token",
    {
      schema: {
        tags: ["Employee Invitations"],
        summary: "Consulta os dados de um convite pelo token (tela de cadastro).",
        params: tokenParamsJsonSchema,
        response: {
          200: invitationTokenResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = tokenParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.getEmployeeInvitationByTokenUseCase.execute(params.data);

      return EmployeeInvitationPresenter.tokenToHttp(output);
    },
  );

  app.post(
    "/employee-invitations/:token/accept",
    {
      schema: {
        tags: ["Employee Invitations"],
        summary: "Conclui o cadastro do funcionário a partir do convite.",
        params: tokenParamsJsonSchema,
        body: acceptInvitationBodyJsonSchema,
        response: {
          201: acceptInvitationResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = tokenParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = acceptInvitationBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.acceptEmployeeInvitationUseCase.execute({
        token: params.data.token,
        fullName: body.data.fullName,
        document: body.data.document,
        password: body.data.password,
      });

      return reply.status(201).send(EmployeeInvitationPresenter.acceptToHttp(output));
    },
  );
}

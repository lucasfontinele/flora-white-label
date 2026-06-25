import type { FastifyInstance, FastifyReply } from "fastify";
import { makeEmployeeInvitationUseCases } from "../../infrastructure/create-employee-invitation-use-cases.factory.js";
import { EmployeeInvitationPresenter } from "./employee-invitation-presenter.js";
import {
  errorResponseSchema,
  invitationListResponseSchema,
  invitationResponseSchema,
} from "./employee-invitation-schemas.js";
import {
  adminInvitationHeadersSchema,
  adminInvitationParamsJsonSchema,
  adminInvitationParamsSchema,
  sendAdminInvitationBodyJsonSchema,
  sendAdminInvitationBodySchema,
} from "./organization-admin-invitation-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

function resolveRequesterUserId(headers: unknown): string {
  const parsed = adminInvitationHeadersSchema.safeParse(headers);
  return parsed.success ? parsed.data["x-master-user-id"] ?? "" : "";
}

/**
 * Master-backoffice routes to provision the master administrator of an
 * organization (full-access role). Guarded by the `x-master-user-id` header —
 * the use cases reject non-Master requesters with a 403. The actual
 * registration is completed by the invitee through the shared
 * `/employee-invitations/:token/accept` flow.
 */
export async function organizationAdminInvitationRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeEmployeeInvitationUseCases(app.prisma);

  app.post(
    "/backoffice/organizations/:organizationId/admin-invitations",
    {
      schema: {
        tags: ["Organization Admin Invitations"],
        summary: "Convida o administrador master de uma organização (restrito a master).",
        params: adminInvitationParamsJsonSchema,
        body: sendAdminInvitationBodyJsonSchema,
        response: {
          201: invitationResponseSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = adminInvitationParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = sendAdminInvitationBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.sendOrganizationAdminInvitationUseCase.execute({
        requesterUserId: resolveRequesterUserId(request.headers),
        organizationId: params.data.organizationId,
        email: body.data.email,
      });

      return reply.status(201).send(EmployeeInvitationPresenter.toHttp(output));
    },
  );

  app.get(
    "/backoffice/organizations/:organizationId/admin-invitations",
    {
      schema: {
        tags: ["Organization Admin Invitations"],
        summary: "Lista os convites de administrador master da organização (restrito a master).",
        params: adminInvitationParamsJsonSchema,
        response: {
          200: invitationListResponseSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = adminInvitationParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.listOrganizationAdminInvitationsUseCase.execute({
        requesterUserId: resolveRequesterUserId(request.headers),
        organizationId: params.data.organizationId,
      });

      return {
        data: output.data.map((invitation) => EmployeeInvitationPresenter.toHttp(invitation)),
      };
    },
  );
}

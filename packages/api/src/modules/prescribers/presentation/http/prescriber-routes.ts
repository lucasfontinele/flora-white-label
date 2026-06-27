import type { FastifyInstance, FastifyReply } from "fastify";
import { makePrescriberUseCases } from "../../infrastructure/create-prescriber-use-cases.factory.js";
import { PrescriberPresenter } from "./prescriber-presenter.js";
import {
  errorResponseSchema,
  prescriberBodyJsonSchema,
  prescriberBodySchema,
  prescriberItemParamsJsonSchema,
  prescriberItemParamsSchema,
  prescriberListParamsJsonSchema,
  prescriberListParamsSchema,
  prescriberListResponseSchema,
  prescriberResponseSchema,
} from "./prescriber-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function prescriberRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makePrescriberUseCases(app.prisma);

  app.get(
    "/organizations/:organizationId/patients/:patientId/prescribers",
    {
      schema: {
        tags: ["Prescribers"],
        summary: "Lista os prescritores (médicos) de um paciente.",
        params: prescriberListParamsJsonSchema,
        response: {
          200: prescriberListResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = prescriberListParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.listPrescribersByPatientUseCase.execute(params.data);

      return {
        data: output.data.map((prescriber) => PrescriberPresenter.toHttp(prescriber)),
      };
    },
  );

  app.post(
    "/organizations/:organizationId/patients/:patientId/prescribers",
    {
      schema: {
        tags: ["Prescribers"],
        summary: "Cadastra um prescritor (nome, CRM e UF) para o paciente.",
        params: prescriberListParamsJsonSchema,
        body: prescriberBodyJsonSchema,
        response: {
          201: prescriberResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = prescriberListParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = prescriberBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.createPrescriberUseCase.execute({
        organizationId: params.data.organizationId,
        patientId: params.data.patientId,
        fullName: body.data.fullName,
        crm: body.data.crm,
        crmState: body.data.crmState,
      });

      return reply.status(201).send(PrescriberPresenter.toHttp(output));
    },
  );

  app.put(
    "/organizations/:organizationId/patients/:patientId/prescribers/:prescriberId",
    {
      schema: {
        tags: ["Prescribers"],
        summary: "Atualiza os dados de um prescritor do paciente.",
        params: prescriberItemParamsJsonSchema,
        body: prescriberBodyJsonSchema,
        response: {
          200: prescriberResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = prescriberItemParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = prescriberBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.updatePrescriberUseCase.execute({
        organizationId: params.data.organizationId,
        patientId: params.data.patientId,
        prescriberId: params.data.prescriberId,
        fullName: body.data.fullName,
        crm: body.data.crm,
        crmState: body.data.crmState,
      });

      return PrescriberPresenter.toHttp(output);
    },
  );

  app.delete(
    "/organizations/:organizationId/patients/:patientId/prescribers/:prescriberId",
    {
      schema: {
        tags: ["Prescribers"],
        summary: "Remove um prescritor do paciente.",
        params: prescriberItemParamsJsonSchema,
        response: {
          204: { type: "null" },
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = prescriberItemParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      await useCases.deletePrescriberUseCase.execute(params.data);

      return reply.status(204).send();
    },
  );
}

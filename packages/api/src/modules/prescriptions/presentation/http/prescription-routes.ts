import type { FastifyInstance, FastifyReply } from "fastify";
import { makePrescriptionUseCases } from "../../infrastructure/create-prescription-use-cases.factory.js";
import { PrescriptionPresenter } from "./prescription-presenter.js";
import {
  errorResponseSchema,
  patientPrescriptionParamsJsonSchema,
  patientPrescriptionParamsSchema,
  patientPrescriptionResponseSchema,
  prescriptionListParamsJsonSchema,
  prescriptionListParamsSchema,
  prescriptionListResponseSchema,
  prescriptionResponseSchema,
  upsertPrescriptionBodyJsonSchema,
  upsertPrescriptionBodySchema,
} from "./prescription-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function prescriptionRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makePrescriptionUseCases(app.prisma);

  app.get(
    "/organizations/:organizationId/prescriptions",
    {
      schema: {
        tags: ["Patient Prescriptions"],
        summary: "Lista as receitas dos pacientes da organização (data limite por paciente).",
        params: prescriptionListParamsJsonSchema,
        response: {
          200: prescriptionListResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = prescriptionListParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.listPatientPrescriptionsUseCase.execute(params.data);

      return {
        data: output.data.map((prescription) => PrescriptionPresenter.toHttp(prescription)),
      };
    },
  );

  app.get(
    "/organizations/:organizationId/patients/:patientId/prescription",
    {
      schema: {
        tags: ["Patient Prescriptions"],
        summary: "Consulta a receita ativa de um paciente (ou null se não houver).",
        params: patientPrescriptionParamsJsonSchema,
        response: {
          200: patientPrescriptionResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientPrescriptionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.getPatientPrescriptionUseCase.execute(params.data);

      return {
        prescription: output.prescription
          ? PrescriptionPresenter.toHttp(output.prescription)
          : null,
      };
    },
  );

  app.put(
    "/organizations/:organizationId/patients/:patientId/prescription",
    {
      schema: {
        tags: ["Patient Prescriptions"],
        summary: "Define ou atualiza a data limite da receita de um paciente.",
        params: patientPrescriptionParamsJsonSchema,
        body: upsertPrescriptionBodyJsonSchema,
        response: {
          200: prescriptionResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientPrescriptionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = upsertPrescriptionBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.upsertPatientPrescriptionUseCase.execute({
        organizationId: params.data.organizationId,
        patientId: params.data.patientId,
        validUntil: body.data.validUntil,
        observations: body.data.observations,
      });

      return PrescriptionPresenter.toHttp(output);
    },
  );

  app.delete(
    "/organizations/:organizationId/patients/:patientId/prescription",
    {
      schema: {
        tags: ["Patient Prescriptions"],
        summary: "Remove a receita ativa de um paciente.",
        params: patientPrescriptionParamsJsonSchema,
        response: {
          204: { type: "null" },
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientPrescriptionParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      await useCases.deletePatientPrescriptionUseCase.execute(params.data);

      return reply.status(204).send();
    },
  );
}

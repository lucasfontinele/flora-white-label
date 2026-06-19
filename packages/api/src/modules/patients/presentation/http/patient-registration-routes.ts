import type { FastifyInstance, FastifyReply } from "fastify";
import { makeCreatePatientRegistrationUseCase } from "../../infrastructure/create-patient-registration.factory.js";
import {
  patientRegistrationBodyJsonSchema,
  patientRegistrationBodySchemaDiscriminated,
  patientRegistrationErrorResponseSchema,
  patientRegistrationParamsJsonSchema,
  patientRegistrationParamsSchema,
  patientRegistrationResponseSchema,
} from "./patient-registration-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function patientRegistrationRoutes(app: FastifyInstance): Promise<void> {
  const createPatientRegistrationUseCase = makeCreatePatientRegistrationUseCase(app.prisma);

  app.post(
    "/organizations/:organizationId/patient-registrations",
    {
      schema: {
        tags: ["Patient Registrations"],
        summary: "Cria um cadastro inicial de paciente, responsável legal ou tutor de pet.",
        params: patientRegistrationParamsJsonSchema,
        body: patientRegistrationBodyJsonSchema,
        response: {
          201: patientRegistrationResponseSchema,
          400: patientRegistrationErrorResponseSchema,
          404: patientRegistrationErrorResponseSchema,
          409: patientRegistrationErrorResponseSchema,
          422: patientRegistrationErrorResponseSchema,
          500: patientRegistrationErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = patientRegistrationParamsSchema.safeParse(request.params);

      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = patientRegistrationBodySchemaDiscriminated.safeParse(request.body);

      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await createPatientRegistrationUseCase.execute({
        organizationId: params.data.organizationId,
        ...body.data,
      });

      return reply.status(201).send(output);
    },
  );
}

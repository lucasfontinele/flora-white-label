import type { FastifyInstance, FastifyReply } from "fastify";
import { makeLookupAddressByZipcodeUseCase } from "../../infrastructure/create-address-lookup.factory.js";
import { AddressPresenter } from "./address-presenter.js";
import {
  validationErrorResponseSchema,
  zipcodeAddressResponseSchema,
  zipcodeParamsJsonSchema,
  zipcodeParamsSchema,
} from "./address-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function addressRoutes(app: FastifyInstance): Promise<void> {
  const lookupAddressByZipcodeUseCase = makeLookupAddressByZipcodeUseCase(app.log);

  app.get(
    "/addresses/zipcode/:zipcode",
    {
      schema: {
        tags: ["Addresses"],
        summary: "Busca um endereço pelo CEP (com fallback entre provedores).",
        params: zipcodeParamsJsonSchema,
        response: {
          200: zipcodeAddressResponseSchema,
          400: validationErrorResponseSchema,
          404: validationErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = zipcodeParamsSchema.safeParse(request.params);

      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const address = await lookupAddressByZipcodeUseCase.execute({ zipcode: params.data.zipcode });

      return AddressPresenter.zipcodeToHttp(address);
    },
  );
}

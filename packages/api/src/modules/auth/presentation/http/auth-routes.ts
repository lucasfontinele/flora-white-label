import type { FastifyInstance, FastifyReply } from "fastify";
import { makeAuthUseCases } from "../../infrastructure/create-auth-use-cases.factory.js";
import { AuthPresenter } from "./auth-presenter.js";
import {
  errorResponseSchema,
  loginBodyJsonSchema,
  loginBodySchema,
  loginResponseSchema,
} from "./auth-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeAuthUseCases(app.prisma);

  app.post(
    "/auth/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Autentica um usuário sistêmico existente.",
        body: loginBodyJsonSchema,
        response: {
          200: loginResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const body = loginBodySchema.safeParse(request.body);

      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.authenticateUserUseCase.execute(body.data);

      return AuthPresenter.loginToHttp(output);
    },
  );
}

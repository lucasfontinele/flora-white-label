import type { FastifyInstance, FastifyReply } from "fastify";
import { makeAuthUseCases } from "../../infrastructure/create-auth-use-cases.factory.js";
import { AuthPresenter } from "./auth-presenter.js";
import {
  errorResponseSchema,
  loginBodyJsonSchema,
  loginBodySchema,
  loginResponseSchema,
  meResponseSchema,
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

  app.get(
    "/me",
    {
      schema: {
        tags: ["Auth"],
        summary:
          "Retorna o contexto do usuário autenticado e reavalia o status do paciente (receita vencida / documentos pendentes ⇒ WAITING_DOCUMENTS).",
        response: {
          200: meResponseSchema,
          401: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      // No server-side session: the web forwards the authenticated user id
      // (same URL/header-trust model used by the org-scoped routes).
      const headerUserId = request.headers["x-user-id"];
      const userId = (Array.isArray(headerUserId) ? headerUserId[0] : headerUserId)?.trim();

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized", message: "Missing user id." });
      }

      const output = await useCases.getMeUseCase.execute({ userId });

      return AuthPresenter.meToHttp(output);
    },
  );
}

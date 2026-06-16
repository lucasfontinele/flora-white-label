import type { FastifyInstance } from "fastify";
import { AppException } from "../../../exception/index.js";

type ErrorResponse = {
  error: {
    code: string;
    details?: unknown;
    message: string;
  };
};

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ error }, "Request failed.");

    if (error instanceof AppException) {
      const response: ErrorResponse = {
        error: {
          code: error.code,
          details: error.details,
          message: error.message,
        },
      };

      return reply.status(error.statusCode).send(response);
    }

    return reply.status(500).send({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro interno do servidor.",
      },
    } satisfies ErrorResponse);
  });
}

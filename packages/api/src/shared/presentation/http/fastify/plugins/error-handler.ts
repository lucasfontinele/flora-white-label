import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { AuthenticationError } from "../../../../application/errors/AuthenticationError.js";
import { ConflictError } from "../../../../application/errors/ConflictError.js";
import { ForbiddenError } from "../../../../application/errors/ForbiddenError.js";
import { NotFoundError } from "../../../../application/errors/NotFoundError.js";
import { DomainError } from "../../../../domain/errors/DomainError.js";
import { DomainValidationError } from "../../../../domain/errors/DomainValidationError.js";

/**
 * Global error handler.
 *
 * Translates transport-agnostic domain errors into HTTP responses. The mapping
 * lives entirely in the presentation layer; the domain remains unaware of HTTP.
 */
async function errorHandler(app: FastifyInstance): Promise<void> {
  app.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      if (error.validation) {
        const validationContext = (error as FastifyError & { validationContext?: string })
          .validationContext;

        const message =
          validationContext === "body"
            ? "Invalid request body."
            : validationContext === "params"
              ? "Invalid request params."
              : "Invalid request.";

        return reply.status(400).send({
          error: "ValidationError",
          message,
        });
      }

      if (error instanceof DomainValidationError) {
        return reply.status(422).send({
          error: error.name,
          message: error.message,
        });
      }

      if (error instanceof DomainError) {
        return reply.status(400).send({
          error: error.name,
          message: error.message,
        });
      }

      if (error instanceof NotFoundError) {
        return reply.status(404).send({
          error: error.name,
          message: error.message,
        });
      }

      if (error instanceof ConflictError) {
        return reply.status(409).send({
          error: error.name,
          message: error.message,
        });
      }

      if (error instanceof ForbiddenError) {
        return reply.status(403).send({
          error: error.name,
          message: error.message,
        });
      }

      if (error instanceof AuthenticationError) {
        return reply.status(401).send({
          error: error.name,
          message: error.message,
        });
      }

      const statusCode = error.statusCode ?? 500;

      if (statusCode >= 500) {
        request.log.error(error);

        return reply.status(statusCode).send({
          error: "InternalServerError",
          message: "Internal Server Error",
        });
      }

      return reply.status(statusCode).send({
        error: error.name,
        message: error.message,
      });
    },
  );
}

export const errorHandlerPlugin = fp(errorHandler, {
  name: "error-handler",
});

import type { FastifyInstance } from "fastify";

const healthResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["status"],
  properties: {
    status: {
      type: "string",
      const: "ok",
    },
  },
} as const;

/**
 * Technical liveness probe. This is the only route exposed by the boilerplate.
 *
 *   GET /health -> { "status": "ok" }
 */
export async function healthRoute(app: FastifyInstance): Promise<void> {
  app.get(
    "/health",
    {
      schema: {
        tags: ["System"],
        summary: "Verifica se a API está saudável.",
        response: {
          200: healthResponseSchema,
        },
      },
    },
    async () => {
      return { status: "ok" };
    },
  );
}

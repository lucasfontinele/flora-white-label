import type { FastifyInstance } from "fastify";

/**
 * Technical liveness probe. This is the only route exposed by the boilerplate.
 *
 *   GET /health -> { "status": "ok" }
 */
export async function healthRoute(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => {
    return { status: "ok" };
  });
}

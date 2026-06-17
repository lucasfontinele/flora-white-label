import Fastify, { type FastifyInstance } from "fastify";
import { errorHandlerPlugin } from "./plugins/error-handler.js";
import { prismaPlugin } from "./plugins/prisma.js";
import { healthRoute } from "./routes/health.route.js";

/**
 * Builds and wires the Fastify application: global plugins first, then routes.
 * Returns an un-listened instance so callers (server bootstrap, tests) control
 * the lifecycle.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  });

  await app.register(errorHandlerPlugin);
  await app.register(prismaPlugin);

  await app.register(healthRoute);

  return app;
}

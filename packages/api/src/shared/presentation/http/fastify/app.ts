import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { env } from "../../../../config/env.js";
import { subscriptionPlanRoutes } from "../../../../modules/subscription-plans/presentation/http/subscription-plan-routes.js";
import { errorHandlerPlugin } from "./plugins/error-handler.js";
import { prismaPlugin } from "./plugins/prisma.js";
import { swaggerDocsPlugin } from "./plugins/swagger.js";
import { healthRoute } from "./routes/health.route.js";
import swaggerUi from "@fastify/swagger-ui";

/**
 * Builds and wires the Fastify application: global plugins first, then routes.
 * Returns an un-listened instance so callers (server bootstrap, tests) control
 * the lifecycle.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: env.CORS_ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(errorHandlerPlugin);
  await app.register(prismaPlugin);
  await app.register(swaggerDocsPlugin);

  await app.register(healthRoute);
  await app.register(subscriptionPlanRoutes);

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  return app;
}

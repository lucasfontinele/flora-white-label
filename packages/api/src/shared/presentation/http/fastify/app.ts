import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { env } from "../../../../config/env.js";
import { addressRoutes } from "../../../../modules/addresses/presentation/http/address-routes.js";
import { authRoutes } from "../../../../modules/auth/presentation/http/auth-routes.js";
import { organizationRoutes } from "../../../../modules/organizations/presentation/http/organization-routes.js";
import { patientRegistrationRoutes } from "../../../../modules/patients/presentation/http/patient-registration-routes.js";
import { subscriptionPlanRoutes } from "../../../../modules/subscription-plans/presentation/http/subscription-plan-routes.js";
import { createCorsOriginDelegate } from "./cors-origin.js";
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
    origin: createCorsOriginDelegate({
      domains: env.CORS_ALLOWED_ORIGIN_DOMAINS,
      exactOrigins: env.CORS_ALLOWED_ORIGINS,
    }),
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(errorHandlerPlugin);
  await app.register(prismaPlugin);
  await app.register(swaggerDocsPlugin);

  await app.register(healthRoute);
  await app.register(authRoutes);
  await app.register(addressRoutes);
  await app.register(patientRegistrationRoutes);
  await app.register(organizationRoutes);
  await app.register(subscriptionPlanRoutes);

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  return app;
}

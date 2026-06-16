import Fastify from "fastify";
import { env } from "../../infrastructure/config/env.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { masterAuthPlugin } from "./plugins/master-auth.js";
import { organizationsRoutes, type OrganizationsRoutesOptions } from "./routes/organizations-routes.js";
import { technicalRoutes } from "./routes/technical-routes.js";

export type BuildServerOptions = OrganizationsRoutesOptions;

export async function buildServer(options: BuildServerOptions = {}) {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === "test" ? "silent" : "info",
    },
  });

  registerErrorHandler(app);
  await app.register(masterAuthPlugin);
  await app.register(technicalRoutes);
  await app.register(organizationsRoutes(options));

  return app;
}

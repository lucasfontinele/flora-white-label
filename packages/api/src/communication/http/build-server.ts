import Fastify from "fastify";
import { env } from "../../infrastructure/config/env.js";
import { registerCors } from "./plugins/cors.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { masterAuthPlugin } from "./plugins/master-auth.js";
import { authenticationPlugin, type AuthenticationPluginOptions } from "./plugins/authentication.js";
import { authenticationRoutes, type AuthenticationRoutesOptions } from "./routes/authentication-routes.js";
import { organizationsRoutes, type OrganizationsRoutesOptions } from "./routes/organizations-routes.js";
import {
  patientRegistrationRoutes,
  type PatientRegistrationRoutesOptions,
} from "./routes/patient-registration-routes.js";
import { subscriptionPlansRoutes, type SubscriptionPlansRoutesOptions } from "./routes/subscription-plans-routes.js";
import { technicalRoutes } from "./routes/technical-routes.js";

export type BuildServerOptions = AuthenticationRoutesOptions &
  AuthenticationPluginOptions &
  OrganizationsRoutesOptions &
  PatientRegistrationRoutesOptions &
  SubscriptionPlansRoutesOptions;

export async function buildServer(options: BuildServerOptions = {}) {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === "test" ? "silent" : "info",
    },
  });

  registerErrorHandler(app);
  await registerCors(app);
  await masterAuthPlugin(app, {});
  await authenticationPlugin(app, options);
  await app.register(technicalRoutes);
  await app.register(authenticationRoutes(options));
  await app.register(patientRegistrationRoutes(options));
  await app.register(subscriptionPlansRoutes(options));
  await app.register(organizationsRoutes(options));

  return app;
}

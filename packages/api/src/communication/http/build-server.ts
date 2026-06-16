import Fastify from "fastify";
import { env } from "../../infrastructure/config/env.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { technicalRoutes } from "./routes/technical-routes.js";

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === "test" ? "silent" : "info",
    },
  });

  registerErrorHandler(app);
  await app.register(technicalRoutes);

  return app;
}

import type { FastifyInstance } from "fastify";
import { buildApp } from "./shared/presentation/http/fastify/app.js";
import { env } from "./config/env.js";

/**
 * Builds the app, starts listening and registers graceful-shutdown handlers.
 * Returns the running instance so it can be awaited/closed by callers.
 */
export async function startServer(): Promise<FastifyInstance> {
  const app = await buildApp();

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    app.log.info({ signal }, "Shutting down API.");
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    await app.listen({ host: env.HOST, port: env.PORT });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }

  return app;
}

import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../../../infrastructure/database/prisma-client.js";

export const technicalRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({
    status: "ok",
  }));

  app.get("/ready", async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      return {
        database: "up",
        status: "ready",
      };
    } catch (error) {
      requestLogReadyFailure(app, error);

      return reply.status(503).send({
        database: "down",
        status: "not_ready",
      });
    }
  });
};

function requestLogReadyFailure(app: Parameters<FastifyPluginAsync>[0], error: unknown) {
  app.log.warn({ error }, "Readiness check failed.");
}

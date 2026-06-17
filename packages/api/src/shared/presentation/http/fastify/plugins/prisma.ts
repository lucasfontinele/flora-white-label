import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { PrismaService } from "../../../../infrastructure/database/prisma/PrismaService.js";

/**
 * Decorates the Fastify instance with a shared {@link PrismaService} and
 * disconnects it when the server closes. Prisma connects lazily on the first
 * query, so registering this plugin does not require a reachable database.
 */
async function prisma(app: FastifyInstance): Promise<void> {
  const prismaService = new PrismaService();

  app.decorate("prisma", prismaService);

  app.addHook("onClose", async (instance) => {
    await instance.prisma.$disconnect();
  });
}

export const prismaPlugin = fp(prisma, {
  name: "prisma",
});

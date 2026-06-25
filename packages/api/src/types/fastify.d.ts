import type { PrismaService } from "../shared/infrastructure/database/prisma/PrismaService.js";

/**
 * Ambient augmentation of the Fastify instance with the decorations added by
 * the application's plugins.
 */
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaService;
  }
}

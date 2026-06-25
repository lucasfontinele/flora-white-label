import { PrismaClient } from "@prisma/client";

/**
 * Thin wrapper around {@link PrismaClient}.
 *
 * It centralises client configuration and gives the rest of the
 * infrastructure layer a single type to depend on. Connection lifecycle is
 * driven by the Fastify `prisma` plugin (connect on demand, disconnect on
 * close). Prisma must never be imported outside the infrastructure layer.
 */
export class PrismaService extends PrismaClient {
  public constructor() {
    super({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
}

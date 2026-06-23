import { describe, it } from "vitest";

describe.skip("productRoutes", () => {
  it("is covered through domain, use-case and schema tests until a Fastify inject database pattern exists", () => {
    /**
     * Existing API route coverage in this codebase is concentrated in use-case
     * and schema tests. Product routes instantiate real Prisma-backed use cases
     * from the Fastify app, so full HTTP success-path coverage needs a shared
     * test database/transaction pattern before it can be added without brittle
     * infrastructure setup.
     */
  });
});

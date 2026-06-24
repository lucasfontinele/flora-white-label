import { describe, it } from "vitest";

describe.skip("orderRoutes", () => {
  it("is covered through domain, use-case, schema and gateway-adapter tests until a Fastify inject database pattern exists", () => {
    /**
     * Existing API route coverage in this codebase is concentrated in use-case,
     * schema and adapter tests. Order routes instantiate real Prisma-backed use
     * cases and a real AbacatePay gateway from the Fastify app, so full HTTP
     * success-path coverage needs a shared test database/transaction pattern and
     * a gateway stub before it can be added without brittle infrastructure
     * setup. This mirrors `product-routes.test.ts` and `inventory-routes.test.ts`.
     */
  });
});

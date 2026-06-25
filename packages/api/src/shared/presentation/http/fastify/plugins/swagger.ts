import swagger from "@fastify/swagger";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function swaggerDocs(app: FastifyInstance): Promise<void> {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Flora API",
        description: "Documentação OpenAPI da API da FloraApp.",
        version: "0.1.0",
      },
    },
  });
}

export const swaggerDocsPlugin = fp(swaggerDocs, {
  name: "swagger-docs",
});
import type { FastifyInstance, FastifyReply } from "fastify";
import { makeProductUseCases } from "../../infrastructure/create-product-use-cases.factory.js";
import { ProductPresenter } from "./product-presenter.js";
import {
  createProductBodySchema,
  errorResponseSchema,
  listProductsQueryJsonSchema,
  listProductsQuerySchema,
  organizationProductParamsJsonSchema,
  organizationProductParamsSchema,
  productListResponseSchema,
  productParamsJsonSchema,
  productParamsSchema,
  productResponseSchema,
  productWriteBodyJsonSchema,
  updateProductBodySchema,
} from "./product-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function productRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeProductUseCases(app.prisma);

  app.post(
    "/organizations/:organizationId/products",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Cria um produto da organização.",
        params: organizationProductParamsJsonSchema,
        body: productWriteBodyJsonSchema,
        response: {
          201: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationProductParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = createProductBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.createProductUseCase.execute({
        organizationId: params.data.organizationId,
        ...body.data,
      });

      return reply.status(201).send(ProductPresenter.toHttp(output));
    },
  );

  app.get(
    "/organizations/:organizationId/products",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Lista produtos da organização.",
        params: organizationProductParamsJsonSchema,
        querystring: listProductsQueryJsonSchema,
        response: {
          200: productListResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationProductParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const query = listProductsQuerySchema.safeParse(request.query);
      if (!query.success) {
        return sendValidationError(reply, "Invalid request query.");
      }

      const output = await useCases.listProductsUseCase.execute(params.data);

      return {
        data: output.data.map((product) => ProductPresenter.toHttp(product)),
      };
    },
  );

  app.get(
    "/organizations/:organizationId/products/:productId",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Busca um produto da organização pelo ID.",
        params: productParamsJsonSchema,
        response: {
          200: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.getProductByIdUseCase.execute(params.data);

      return ProductPresenter.toHttp(output);
    },
  );

  app.put(
    "/organizations/:organizationId/products/:productId",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Atualiza um produto da organização.",
        params: productParamsJsonSchema,
        body: productWriteBodyJsonSchema,
        response: {
          200: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = updateProductBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.updateProductUseCase.execute({
        ...params.data,
        ...body.data,
      });

      return ProductPresenter.toHttp(output);
    },
  );

  app.delete(
    "/organizations/:organizationId/products/:productId",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Remove logicamente um produto da organização.",
        params: productParamsJsonSchema,
        response: {
          200: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.deleteProductUseCase.execute(params.data);

      return ProductPresenter.toHttp(output);
    },
  );

  app.patch(
    "/organizations/:organizationId/products/:productId/activate",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Ativa um produto da organização.",
        params: productParamsJsonSchema,
        response: {
          200: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.activateProductUseCase.execute(params.data);

      return ProductPresenter.toHttp(output);
    },
  );

  app.patch(
    "/organizations/:organizationId/products/:productId/deactivate",
    {
      schema: {
        tags: ["Organization Products"],
        summary: "Desativa um produto da organização.",
        params: productParamsJsonSchema,
        response: {
          200: productResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.deactivateProductUseCase.execute(params.data);

      return ProductPresenter.toHttp(output);
    },
  );
}

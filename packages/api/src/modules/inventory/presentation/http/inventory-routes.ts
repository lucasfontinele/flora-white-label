import type { FastifyInstance, FastifyReply } from "fastify";
import { makeInventoryUseCases } from "../../infrastructure/create-inventory-use-cases.factory.js";
import { InventoryPresenter } from "./inventory-presenter.js";
import {
  adjustStockBodyJsonSchema,
  adjustStockBodySchema,
  createInventoryItemBodyJsonSchema,
  createInventoryItemBodySchema,
  errorResponseSchema,
  inventoryItemResponseSchema,
  inventoryMovementListResponseSchema,
  productScopedParamsJsonSchema,
  productScopedParamsSchema,
  stockOperationBodyJsonSchema,
  stockOperationBodySchema,
} from "./inventory-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function inventoryRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeInventoryUseCases(app.prisma);

  app.post(
    "/organizations/:organizationId/products/:productId/inventory",
    {
      schema: {
        tags: ["Organization Product Inventory"],
        summary: "Cria a posição de estoque de um produto.",
        params: productScopedParamsJsonSchema,
        body: createInventoryItemBodyJsonSchema,
        response: {
          201: inventoryItemResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productScopedParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = createInventoryItemBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.createInventoryItemUseCase.execute({
        ...params.data,
        ...body.data,
      });

      return reply.status(201).send(InventoryPresenter.toItemHttp(output));
    },
  );

  app.get(
    "/organizations/:organizationId/products/:productId/inventory",
    {
      schema: {
        tags: ["Organization Product Inventory"],
        summary: "Consulta a posição de estoque de um produto.",
        params: productScopedParamsJsonSchema,
        response: {
          200: inventoryItemResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productScopedParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.getInventoryItemUseCase.execute(params.data);

      return InventoryPresenter.toItemHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/products/:productId/inventory/add-stock",
    {
      schema: {
        tags: ["Organization Product Inventory"],
        summary: "Registra entrada de estoque.",
        params: productScopedParamsJsonSchema,
        body: stockOperationBodyJsonSchema,
        response: {
          200: inventoryItemResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productScopedParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = stockOperationBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.addStockUseCase.execute({
        ...params.data,
        ...body.data,
      });

      return InventoryPresenter.toItemHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/products/:productId/inventory/reserve",
    {
      schema: {
        tags: ["Organization Product Inventory"],
        summary: "Reserva quantidade disponível.",
        params: productScopedParamsJsonSchema,
        body: stockOperationBodyJsonSchema,
        response: {
          200: inventoryItemResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productScopedParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = stockOperationBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.reserveStockUseCase.execute({
        ...params.data,
        ...body.data,
      });

      return InventoryPresenter.toItemHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/products/:productId/inventory/release-reservation",
    {
      schema: {
        tags: ["Organization Product Inventory"],
        summary: "Libera reserva de estoque.",
        params: productScopedParamsJsonSchema,
        body: stockOperationBodyJsonSchema,
        response: {
          200: inventoryItemResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productScopedParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = stockOperationBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.releaseReservationUseCase.execute({
        ...params.data,
        ...body.data,
      });

      return InventoryPresenter.toItemHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/products/:productId/inventory/confirm-stock-out",
    {
      schema: {
        tags: ["Organization Product Inventory"],
        summary: "Confirma saída de estoque reservado.",
        params: productScopedParamsJsonSchema,
        body: stockOperationBodyJsonSchema,
        response: {
          200: inventoryItemResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productScopedParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = stockOperationBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.confirmStockOutUseCase.execute({
        ...params.data,
        ...body.data,
      });

      return InventoryPresenter.toItemHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/products/:productId/inventory/adjust",
    {
      schema: {
        tags: ["Organization Product Inventory"],
        summary: "Ajusta a quantidade disponível de estoque.",
        params: productScopedParamsJsonSchema,
        body: adjustStockBodyJsonSchema,
        response: {
          200: inventoryItemResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productScopedParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = adjustStockBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.adjustStockUseCase.execute({
        ...params.data,
        ...body.data,
      });

      return InventoryPresenter.toItemHttp(output);
    },
  );

  app.get(
    "/organizations/:organizationId/products/:productId/inventory/movements",
    {
      schema: {
        tags: ["Organization Product Inventory"],
        summary: "Lista o histórico de movimentações de estoque.",
        params: productScopedParamsJsonSchema,
        response: {
          200: inventoryMovementListResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = productScopedParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.listInventoryMovementsUseCase.execute(params.data);

      return {
        data: output.data.map((movement) => InventoryPresenter.toMovementHttp(movement)),
      };
    },
  );
}

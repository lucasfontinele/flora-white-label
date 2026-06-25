import type { FastifyInstance, FastifyReply } from "fastify";
import { makeOrderUseCases } from "../../infrastructure/create-order-use-cases.factory.js";
import { OrderPaymentPresenter } from "./order-payment-presenter.js";
import { OrderPresenter } from "./order-presenter.js";
import {
  createOrderBodyJsonSchema,
  createOrderBodySchema,
  createPaymentBodyJsonSchema,
  createPaymentBodySchema,
  errorResponseSchema,
  listOrdersQueryJsonSchema,
  listOrdersQuerySchema,
  orderListResponseSchema,
  orderParamsJsonSchema,
  orderParamsSchema,
  orderPaymentListResponseSchema,
  orderPaymentResponseSchema,
  orderResponseSchema,
  organizationParamsJsonSchema,
  organizationParamsSchema,
  paymentParamsJsonSchema,
  paymentParamsSchema,
} from "./order-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeOrderUseCases(app.prisma);

  app.post(
    "/organizations/:organizationId/orders",
    {
      schema: {
        tags: ["Orders"],
        summary: "Cria um pedido de produtos para um paciente.",
        params: organizationParamsJsonSchema,
        body: createOrderBodyJsonSchema,
        response: {
          201: orderResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = createOrderBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.createOrderUseCase.execute({
        organizationId: params.data.organizationId,
        patientId: body.data.patientId,
        guardianId: body.data.guardianId ?? null,
        deliveryType: body.data.deliveryType,
        items: body.data.items,
      });

      return reply.status(201).send(OrderPresenter.toHttp(output));
    },
  );

  app.get(
    "/organizations/:organizationId/orders",
    {
      schema: {
        tags: ["Orders"],
        summary: "Lista os pedidos da organização, opcionalmente filtrando por status.",
        params: organizationParamsJsonSchema,
        querystring: listOrdersQueryJsonSchema,
        response: {
          200: orderListResponseSchema,
          400: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = organizationParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const query = listOrdersQuerySchema.safeParse(request.query);
      if (!query.success) {
        return sendValidationError(reply, "Invalid request query.");
      }

      const output = await useCases.listOrdersUseCase.execute({
        organizationId: params.data.organizationId,
        statuses: query.data.status,
        patientId: query.data.patientId,
      });

      return {
        data: output.data.map((order) => OrderPresenter.toHttp(order)),
      };
    },
  );

  app.get(
    "/organizations/:organizationId/orders/:orderId",
    {
      schema: {
        tags: ["Orders"],
        summary: "Consulta um pedido da organização pelo ID.",
        params: orderParamsJsonSchema,
        response: {
          200: orderResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = orderParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.getOrderByIdUseCase.execute(params.data);

      return OrderPresenter.toHttp(output);
    },
  );

  app.patch(
    "/organizations/:organizationId/orders/:orderId/cancel",
    {
      schema: {
        tags: ["Orders"],
        summary: "Cancela um pedido da organização.",
        params: orderParamsJsonSchema,
        response: {
          200: orderResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = orderParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.cancelOrderUseCase.execute(params.data);

      return OrderPresenter.toHttp(output);
    },
  );

  app.patch(
    "/organizations/:organizationId/orders/:orderId/ready-for-pickup",
    {
      schema: {
        tags: ["Orders"],
        summary: "Marca o pedido como pronto para retirada na sede.",
        params: orderParamsJsonSchema,
        response: {
          200: orderResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = orderParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.updateOrderFulfillmentStatusUseCase.execute({
        ...params.data,
        target: "READY_FOR_PICKUP",
      });

      return OrderPresenter.toHttp(output);
    },
  );

  app.patch(
    "/organizations/:organizationId/orders/:orderId/ship",
    {
      schema: {
        tags: ["Orders"],
        summary: "Marca o pedido como enviado/aguardando correios.",
        params: orderParamsJsonSchema,
        response: {
          200: orderResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = orderParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.updateOrderFulfillmentStatusUseCase.execute({
        ...params.data,
        target: "SHIPPED",
      });

      return OrderPresenter.toHttp(output);
    },
  );

  app.post(
    "/organizations/:organizationId/orders/:orderId/payments",
    {
      schema: {
        tags: ["Order Payments"],
        summary: "Cria um pagamento do pedido e inicia a cobrança no gateway.",
        params: orderParamsJsonSchema,
        body: createPaymentBodyJsonSchema,
        response: {
          201: orderPaymentResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
          502: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = orderParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = createPaymentBodySchema.safeParse(request.body);
      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const output = await useCases.createOrderPaymentUseCase.execute({
        organizationId: params.data.organizationId,
        orderId: params.data.orderId,
        paymentMethod: body.data.paymentMethod,
        discount: body.data.discount ?? null,
      });

      return reply.status(201).send(OrderPaymentPresenter.toHttp(output));
    },
  );

  app.get(
    "/organizations/:organizationId/orders/:orderId/payments",
    {
      schema: {
        tags: ["Order Payments"],
        summary: "Lista os pagamentos do pedido.",
        params: orderParamsJsonSchema,
        response: {
          200: orderPaymentListResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = orderParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.listOrderPaymentsUseCase.execute(params.data);

      return {
        data: output.data.map((payment) => OrderPaymentPresenter.toHttp(payment)),
      };
    },
  );

  app.get(
    "/organizations/:organizationId/orders/:orderId/payments/:paymentId",
    {
      schema: {
        tags: ["Order Payments"],
        summary: "Consulta um pagamento do pedido pelo ID.",
        params: paymentParamsJsonSchema,
        response: {
          200: orderPaymentResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = paymentParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.getOrderPaymentByIdUseCase.execute(params.data);

      return OrderPaymentPresenter.toHttp(output);
    },
  );

  app.patch(
    "/organizations/:organizationId/orders/:orderId/payments/:paymentId/sync-status",
    {
      schema: {
        tags: ["Order Payments"],
        summary: "Sincroniza o status do pagamento com o gateway.",
        params: paymentParamsJsonSchema,
        response: {
          200: orderPaymentResponseSchema,
          400: errorResponseSchema,
          404: errorResponseSchema,
          422: errorResponseSchema,
          500: errorResponseSchema,
          502: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = paymentParamsSchema.safeParse(request.params);
      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const output = await useCases.syncOrderPaymentStatusUseCase.execute(params.data);

      return OrderPaymentPresenter.toHttp(output);
    },
  );
}

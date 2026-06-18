import type { FastifyInstance, FastifyReply } from "fastify";
import { makeSubscriptionPlanUseCases } from "../../infrastructure/create-subscription-plan-use-cases.factory.js";
import { SubscriptionPlanPresenter } from "./subscription-plan-presenter.js";
import {
  createSubscriptionPlanBodySchema,
  subscriptionPlanParamsJsonSchema,
  subscriptionPlanListResponseSchema,
  subscriptionPlanResponseSchema,
  subscriptionPlanWriteBodyJsonSchema,
  subscriptionPlanParamsSchema,
  validationErrorResponseSchema,
  updateSubscriptionPlanBodySchema,
} from "./subscription-plan-schemas.js";

function sendValidationError(reply: FastifyReply, message: string): FastifyReply {
  return reply.status(400).send({
    error: "ValidationError",
    message,
  });
}

export async function subscriptionPlanRoutes(app: FastifyInstance): Promise<void> {
  const useCases = makeSubscriptionPlanUseCases(app.prisma);

  app.post(
    "/backoffice/subscription-plans",
    {
      schema: {
        tags: ["Subscription Plans"],
        summary: "Cria um plano de assinatura.",
        body: subscriptionPlanWriteBodyJsonSchema,
        response: {
          201: subscriptionPlanResponseSchema,
          400: validationErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const body = createSubscriptionPlanBodySchema.safeParse(request.body);

      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const plan = await useCases.createSubscriptionPlanUseCase.execute(body.data);

      return reply.status(201).send(SubscriptionPlanPresenter.toHttp(plan));
    },
  );

  app.get(
    "/backoffice/subscription-plans",
    {
      schema: {
        tags: ["Subscription Plans"],
        summary: "Lista os planos de assinatura.",
        response: {
          200: subscriptionPlanListResponseSchema,
        },
      },
    },
    async () => {
      const output = await useCases.listSubscriptionPlansUseCase.execute();

      return {
        data: output.data.map((plan) => SubscriptionPlanPresenter.toHttp(plan)),
      };
    },
  );

  app.get(
    "/backoffice/subscription-plans/:id",
    {
      schema: {
        tags: ["Subscription Plans"],
        summary: "Busca um plano de assinatura pelo ID.",
        params: subscriptionPlanParamsJsonSchema,
        response: {
          200: subscriptionPlanResponseSchema,
          400: validationErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = subscriptionPlanParamsSchema.safeParse(request.params);

      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const plan = await useCases.getSubscriptionPlanByIdUseCase.execute(params.data);

      return SubscriptionPlanPresenter.toHttp(plan);
    },
  );

  app.put(
    "/backoffice/subscription-plans/:id",
    {
      schema: {
        tags: ["Subscription Plans"],
        summary: "Atualiza um plano de assinatura.",
        params: subscriptionPlanParamsJsonSchema,
        body: subscriptionPlanWriteBodyJsonSchema,
        response: {
          200: subscriptionPlanResponseSchema,
          400: validationErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = subscriptionPlanParamsSchema.safeParse(request.params);

      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      const body = updateSubscriptionPlanBodySchema.safeParse(request.body);

      if (!body.success) {
        return sendValidationError(reply, "Invalid request body.");
      }

      const plan = await useCases.updateSubscriptionPlanUseCase.execute({
        id: params.data.id,
        ...body.data,
      });

      return SubscriptionPlanPresenter.toHttp(plan);
    },
  );

  app.delete(
    "/backoffice/subscription-plans/:id",
    {
      schema: {
        tags: ["Subscription Plans"],
        summary: "Remove um plano de assinatura.",
        params: subscriptionPlanParamsJsonSchema,
        response: {
          204: {
            type: "null",
          },
          400: validationErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const params = subscriptionPlanParamsSchema.safeParse(request.params);

      if (!params.success) {
        return sendValidationError(reply, "Invalid request params.");
      }

      await useCases.deleteSubscriptionPlanUseCase.execute(params.data);

      return reply.status(204).send();
    },
  );
}

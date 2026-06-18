import { z } from "zod";

const optionalDescriptionSchema = z
  .string()
  .trim()
  .min(1, "description must not be blank.")
  .nullable()
  .optional();

const subscriptionPlanWriteBodySchema = z
  .object({
    title: z.string().trim().min(1, "title is required."),
    description: optionalDescriptionSchema,
    priceInCents: z.number().int().nonnegative(),
    operatorsLimit: z.number().int().positive(),
    patientsLimit: z.number().int().positive(),
  })
  .strict();

export const createSubscriptionPlanBodySchema = subscriptionPlanWriteBodySchema;
export const updateSubscriptionPlanBodySchema = subscriptionPlanWriteBodySchema;

export const subscriptionPlanParamsSchema = z
  .object({
    id: z.string().trim().min(1, "id is required."),
  })
  .strict();

export const subscriptionPlanWriteBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "priceInCents", "operatorsLimit", "patientsLimit"],
  properties: {
    title: {
      type: "string",
      minLength: 1,
    },
    description: {
      type: ["string", "null"],
      minLength: 1,
    },
    priceInCents: {
      type: "integer",
      minimum: 0,
    },
    operatorsLimit: {
      type: "integer",
      minimum: 1,
    },
    patientsLimit: {
      type: "integer",
      minimum: 1,
    },
  },
} as const;

export const subscriptionPlanParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: {
      type: "string",
      minLength: 1,
    },
  },
} as const;

export const validationErrorResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["error", "message"],
  properties: {
    error: {
      type: "string",
    },
    message: {
      type: "string",
    },
  },
} as const;

export const subscriptionPlanResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "title",
    "description",
    "priceInCents",
    "operatorsLimit",
    "patientsLimit",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: {
      type: "string",
      minLength: 1,
    },
    title: {
      type: "string",
      minLength: 1,
    },
    description: {
      type: ["string", "null"],
    },
    priceInCents: {
      type: "integer",
      minimum: 0,
    },
    operatorsLimit: {
      type: "integer",
      minimum: 1,
    },
    patientsLimit: {
      type: "integer",
      minimum: 1,
    },
    createdAt: {
      type: "string",
      format: "date-time",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
    },
  },
} as const;

export const subscriptionPlanListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: subscriptionPlanResponseSchema,
    },
  },
} as const;

export type CreateSubscriptionPlanBody = z.infer<typeof createSubscriptionPlanBodySchema>;
export type UpdateSubscriptionPlanBody = z.infer<typeof updateSubscriptionPlanBodySchema>;
export type SubscriptionPlanParams = z.infer<typeof subscriptionPlanParamsSchema>;

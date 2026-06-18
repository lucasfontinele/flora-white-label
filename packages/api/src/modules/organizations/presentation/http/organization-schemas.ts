import { z } from "zod";
import { isValidBrazilianState } from "../../../addresses/domain/brazilian-states.js";

const nullableTrimmedTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const cnpjSchema = z.string().trim().min(1, "cnpj is required.").refine(
  (value) => value.replace(/\D/g, "").length === 14,
  "cnpj must have exactly 14 digits.",
);

const cnaeSchema = z.string().trim().min(1).refine(
  (value) => value.replace(/\D/g, "").length === 7,
  "cnae must have exactly 7 digits.",
);

const zipcodeSchema = z.string().trim().min(1, "zipcode is required.").refine(
  (value) => value.replace(/\D/g, "").length === 8,
  "zipcode must have exactly 8 digits.",
);

const stateSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => isValidBrazilianState(value), "state must be a valid Brazilian UF.");

const organizationWriteDataSchema = z
  .object({
    tradeName: z.string().trim().min(1, "tradeName is required."),
    legalName: z.string().trim().min(1, "legalName is required."),
    cnpj: cnpjSchema,
    primaryCnae: cnaeSchema,
    secondaryCnaes: z.array(cnaeSchema).optional().default([]),
    currentPlanId: z.string().trim().min(1, "currentPlanId is required."),
  })
  .strict();

const addressWriteDataSchema = z
  .object({
    title: nullableTrimmedTextSchema,
    zipcode: zipcodeSchema,
    street: z.string().trim().min(1, "street is required."),
    neighborhood: z.string().trim().min(1, "neighborhood is required."),
    complement: nullableTrimmedTextSchema,
    city: z.string().trim().min(1, "city is required."),
    state: stateSchema,
  })
  .strict();

const organizationWriteBodySchema = z
  .object({
    organization: organizationWriteDataSchema,
    address: addressWriteDataSchema,
  })
  .strict();

export const createOrganizationBodySchema = organizationWriteBodySchema;
export const updateOrganizationBodySchema = organizationWriteBodySchema;

export const organizationParamsSchema = z
  .object({
    id: z.string().trim().min(1, "id is required."),
  })
  .strict();

export const listOrganizationsQuerySchema = z.object({}).strict();

export const organizationWriteBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organization", "address"],
  properties: {
    organization: {
      type: "object",
      additionalProperties: false,
      required: ["tradeName", "legalName", "cnpj", "primaryCnae", "currentPlanId"],
      properties: {
        tradeName: { type: "string", minLength: 1 },
        legalName: { type: "string", minLength: 1 },
        cnpj: { type: "string", minLength: 1 },
        primaryCnae: { type: "string", minLength: 1 },
        secondaryCnaes: {
          type: "array",
          items: { type: "string", minLength: 1 },
        },
        currentPlanId: { type: "string", minLength: 1 },
      },
    },
    address: {
      type: "object",
      additionalProperties: false,
      required: ["zipcode", "street", "neighborhood", "city", "state"],
      properties: {
        title: { type: ["string", "null"] },
        zipcode: { type: "string", minLength: 1 },
        street: { type: "string", minLength: 1 },
        neighborhood: { type: "string", minLength: 1 },
        complement: { type: ["string", "null"] },
        city: { type: "string", minLength: 1 },
        state: { type: "string", minLength: 2, maxLength: 2 },
      },
    },
  },
} as const;

export const organizationParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: { type: "string", minLength: 1 },
  },
} as const;

export const listOrganizationsQueryJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {},
} as const;

export const validationErrorResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["error", "message"],
  properties: {
    error: { type: "string" },
    message: { type: "string" },
  },
} as const;

export const organizationResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "tradeName",
    "legalName",
    "cnpj",
    "primaryCnae",
    "secondaryCnaes",
    "currentPlan",
    "address",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string" },
    tradeName: { type: "string" },
    legalName: { type: "string" },
    cnpj: { type: "string", pattern: "^\\d{14}$" },
    primaryCnae: { type: "string", pattern: "^\\d{7}$" },
    secondaryCnaes: {
      type: "array",
      items: { type: "string", pattern: "^\\d{7}$" },
    },
    currentPlan: {
      type: "object",
      additionalProperties: false,
      required: ["id", "title", "priceInCents", "operatorsLimit", "patientsLimit"],
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        priceInCents: { type: "integer", minimum: 0 },
        operatorsLimit: { type: "integer", minimum: 0 },
        patientsLimit: { type: "integer", minimum: 1 },
      },
    },
    address: {
      type: "object",
      additionalProperties: false,
      required: [
        "id",
        "title",
        "zipcode",
        "street",
        "neighborhood",
        "complement",
        "city",
        "state",
      ],
      properties: {
        id: { type: "string" },
        title: { type: ["string", "null"] },
        zipcode: { type: "string", pattern: "^\\d{8}$" },
        street: { type: "string" },
        neighborhood: { type: "string" },
        complement: { type: ["string", "null"] },
        city: { type: "string" },
        state: { type: "string", minLength: 2, maxLength: 2 },
      },
    },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const organizationListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: organizationResponseSchema,
    },
  },
} as const;

export type CreateOrganizationBody = z.infer<typeof createOrganizationBodySchema>;
export type UpdateOrganizationBody = z.infer<typeof updateOrganizationBodySchema>;
export type OrganizationParams = z.infer<typeof organizationParamsSchema>;

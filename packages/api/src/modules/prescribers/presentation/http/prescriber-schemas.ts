import { z } from "zod";
import { isValidBrazilianState } from "../../../addresses/domain/brazilian-states.js";

const nonBlankString = (field: string) => z.string().trim().min(1, `${field} is required.`);

const crmStateSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => isValidBrazilianState(value), {
    message: "crmState must be a valid Brazilian UF.",
  });

export const prescriberListParamsSchema = z
  .object({
    organizationId: nonBlankString("organizationId"),
    patientId: nonBlankString("patientId"),
  })
  .strict();

export const prescriberItemParamsSchema = prescriberListParamsSchema
  .extend({
    prescriberId: nonBlankString("prescriberId"),
  })
  .strict();

export const prescriberBodySchema = z
  .object({
    fullName: nonBlankString("fullName"),
    crm: nonBlankString("crm"),
    crmState: crmStateSchema,
  })
  .strict();

const idParamJsonProperty = {
  type: "string",
  minLength: 1,
} as const;

export const prescriberListParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "patientId"],
  properties: {
    organizationId: idParamJsonProperty,
    patientId: idParamJsonProperty,
  },
} as const;

export const prescriberItemParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "patientId", "prescriberId"],
  properties: {
    organizationId: idParamJsonProperty,
    patientId: idParamJsonProperty,
    prescriberId: idParamJsonProperty,
  },
} as const;

export const prescriberBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["fullName", "crm", "crmState"],
  properties: {
    fullName: { type: "string", minLength: 1 },
    crm: { type: "string", minLength: 1 },
    crmState: { type: "string", minLength: 2, maxLength: 2 },
  },
} as const;

export const errorResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["error", "message"],
  properties: {
    error: { type: "string" },
    message: { type: "string" },
  },
} as const;

export const prescriberResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "organizationId",
    "patientId",
    "fullName",
    "crm",
    "crmState",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: idParamJsonProperty,
    organizationId: idParamJsonProperty,
    patientId: idParamJsonProperty,
    fullName: { type: "string" },
    crm: { type: "string" },
    crmState: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const prescriberListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: prescriberResponseSchema,
    },
  },
} as const;

export type PrescriberListParams = z.infer<typeof prescriberListParamsSchema>;
export type PrescriberItemParams = z.infer<typeof prescriberItemParamsSchema>;
export type PrescriberBody = z.infer<typeof prescriberBodySchema>;

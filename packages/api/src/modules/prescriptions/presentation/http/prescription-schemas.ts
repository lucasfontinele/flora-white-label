import { z } from "zod";

const nonBlankString = (field: string) => z.string().trim().min(1, `${field} is required.`);

export const prescriptionListParamsSchema = z
  .object({
    organizationId: nonBlankString("organizationId"),
  })
  .strict();

export const patientPrescriptionParamsSchema = prescriptionListParamsSchema
  .extend({
    patientId: nonBlankString("patientId"),
  })
  .strict();

export const upsertPrescriptionBodySchema = z
  .object({
    // Accepts an ISO date-time or a "YYYY-MM-DD" date; coerced to a Date.
    validUntil: z.coerce.date(),
    observations: z.string().trim().nullish(),
  })
  .strict();

const idParamJsonProperty = {
  type: "string",
  minLength: 1,
} as const;

export const prescriptionListParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId"],
  properties: {
    organizationId: idParamJsonProperty,
  },
} as const;

export const patientPrescriptionParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "patientId"],
  properties: {
    organizationId: idParamJsonProperty,
    patientId: idParamJsonProperty,
  },
} as const;

export const upsertPrescriptionBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["validUntil"],
  properties: {
    validUntil: { type: "string", minLength: 1 },
    observations: { type: ["string", "null"] },
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

export const prescriptionResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "organizationId",
    "patientId",
    "patientName",
    "validUntil",
    "observations",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: idParamJsonProperty,
    organizationId: idParamJsonProperty,
    patientId: idParamJsonProperty,
    patientName: { type: "string" },
    validUntil: { type: "string", format: "date-time" },
    observations: { type: ["string", "null"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const prescriptionListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: prescriptionResponseSchema,
    },
  },
} as const;

export const patientPrescriptionResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["prescription"],
  properties: {
    prescription: { ...prescriptionResponseSchema, type: ["object", "null"] },
  },
} as const;

export type PrescriptionListParams = z.infer<typeof prescriptionListParamsSchema>;
export type PatientPrescriptionParams = z.infer<typeof patientPrescriptionParamsSchema>;
export type UpsertPrescriptionBody = z.infer<typeof upsertPrescriptionBodySchema>;

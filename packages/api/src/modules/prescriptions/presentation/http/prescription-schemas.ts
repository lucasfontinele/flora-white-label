import { z } from "zod";
import { ProductCategory } from "../../../products/domain/enums/ProductCategory.js";
import { PrescriptionItemScope } from "../../domain/enums/PrescriptionItemScope.js";
import { PrescriptionPeriod } from "../../domain/enums/PrescriptionPeriod.js";

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

const upsertPrescriptionItemSchema = z
  .object({
    scope: z.nativeEnum(PrescriptionItemScope),
    productId: z.string().trim().min(1).nullish(),
    category: z.nativeEnum(ProductCategory).nullish(),
    allowedQuantity: z.number().int().min(1, "allowedQuantity must be at least 1."),
    period: z.nativeEnum(PrescriptionPeriod),
    notes: z.string().trim().nullish(),
  })
  .strict()
  .refine(
    (item) =>
      item.scope === PrescriptionItemScope.Product
        ? Boolean(item.productId)
        : Boolean(item.category),
    {
      message: "productId is required for PRODUCT scope, category for CATEGORY scope.",
    },
  );

export const upsertPrescriptionBodySchema = z
  .object({
    // Emission date of the receita (ISO date-time or "YYYY-MM-DD"); validUntil
    // is derived server-side as issuedAt + 6 months.
    issuedAt: z.coerce.date(),
    observations: z.string().trim().nullish(),
    items: z.array(upsertPrescriptionItemSchema),
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
  required: ["issuedAt", "items"],
  properties: {
    issuedAt: { type: "string", minLength: 1 },
    observations: { type: ["string", "null"] },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["scope", "allowedQuantity", "period"],
        properties: {
          scope: { type: "string", enum: ["PRODUCT", "CATEGORY"] },
          productId: { type: ["string", "null"] },
          category: { type: ["string", "null"] },
          allowedQuantity: { type: "integer", minimum: 1 },
          period: { type: "string", enum: ["MONTHLY", "ANNUAL"] },
          notes: { type: ["string", "null"] },
        },
      },
    },
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

const prescriptionItemResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "scope",
    "productId",
    "productName",
    "productUnit",
    "category",
    "allowedQuantity",
    "period",
    "notes",
  ],
  properties: {
    id: idParamJsonProperty,
    scope: { type: "string" },
    productId: { type: ["string", "null"] },
    productName: { type: ["string", "null"] },
    productUnit: { type: ["string", "null"] },
    category: { type: ["string", "null"] },
    allowedQuantity: { type: "integer" },
    period: { type: "string" },
    notes: { type: ["string", "null"] },
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
    "issuedAt",
    "validUntil",
    "observations",
    "items",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: idParamJsonProperty,
    organizationId: idParamJsonProperty,
    patientId: idParamJsonProperty,
    patientName: { type: "string" },
    issuedAt: { type: "string", format: "date-time" },
    validUntil: { type: "string", format: "date-time" },
    observations: { type: ["string", "null"] },
    items: { type: "array", items: prescriptionItemResponseSchema },
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

const purchaseLimitItemResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "scope",
    "productId",
    "productName",
    "category",
    "unit",
    "period",
    "allowedQuantity",
    "used",
    "remaining",
    "notes",
  ],
  properties: {
    scope: { type: "string" },
    productId: { type: ["string", "null"] },
    productName: { type: ["string", "null"] },
    category: { type: ["string", "null"] },
    unit: { type: ["string", "null"] },
    period: { type: "string" },
    allowedQuantity: { type: "integer" },
    used: { type: "integer" },
    remaining: { type: "integer" },
    notes: { type: ["string", "null"] },
  },
} as const;

export const purchaseLimitsResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["hasPrescription", "issuedAt", "validUntil", "isExpired", "items"],
  properties: {
    hasPrescription: { type: "boolean" },
    issuedAt: { type: ["string", "null"], format: "date-time" },
    validUntil: { type: ["string", "null"], format: "date-time" },
    isExpired: { type: "boolean" },
    items: { type: "array", items: purchaseLimitItemResponseSchema },
  },
} as const;

export type PrescriptionListParams = z.infer<typeof prescriptionListParamsSchema>;
export type PatientPrescriptionParams = z.infer<typeof patientPrescriptionParamsSchema>;
export type UpsertPrescriptionBody = z.infer<typeof upsertPrescriptionBodySchema>;

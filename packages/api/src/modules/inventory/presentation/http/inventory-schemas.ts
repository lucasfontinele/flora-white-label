import { z } from "zod";
import { InventoryMovementType } from "../../domain/enums/InventoryMovementType.js";

const nonBlankString = (field: string) => z.string().trim().min(1, `${field} is required.`);

const inventoryMovementTypeValues = [
  InventoryMovementType.In,
  InventoryMovementType.Out,
  InventoryMovementType.Reserve,
  InventoryMovementType.Release,
  InventoryMovementType.Adjustment,
] as const;

const optionalReasonSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export const productScopedParamsSchema = z
  .object({
    organizationId: nonBlankString("organizationId"),
    productId: nonBlankString("productId"),
  })
  .strict();

export const createInventoryItemBodySchema = z
  .object({
    availableQuantity: z.number().int().nonnegative().optional(),
    minimumQuantity: z.number().int().nonnegative().optional(),
    reason: optionalReasonSchema,
    createdByUserId: nonBlankString("createdByUserId"),
  })
  .strict();

export const stockOperationBodySchema = z
  .object({
    quantity: z.number().int().positive(),
    reason: optionalReasonSchema,
    createdByUserId: nonBlankString("createdByUserId"),
  })
  .strict();

export const adjustStockBodySchema = z
  .object({
    quantity: z.number().int().nonnegative(),
    reason: optionalReasonSchema,
    createdByUserId: nonBlankString("createdByUserId"),
  })
  .strict();

const idParamJsonProperty = {
  type: "string",
  minLength: 1,
} as const;

export const productScopedParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "productId"],
  properties: {
    organizationId: idParamJsonProperty,
    productId: idParamJsonProperty,
  },
} as const;

export const createInventoryItemBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["createdByUserId"],
  properties: {
    availableQuantity: { type: "integer", minimum: 0 },
    minimumQuantity: { type: "integer", minimum: 0 },
    reason: { type: ["string", "null"] },
    createdByUserId: { type: "string", minLength: 1 },
  },
} as const;

export const stockOperationBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["quantity", "createdByUserId"],
  properties: {
    quantity: { type: "integer", minimum: 1 },
    reason: { type: ["string", "null"] },
    createdByUserId: { type: "string", minLength: 1 },
  },
} as const;

export const adjustStockBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["quantity", "createdByUserId"],
  properties: {
    quantity: { type: "integer", minimum: 0 },
    reason: { type: ["string", "null"] },
    createdByUserId: { type: "string", minLength: 1 },
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

export const inventoryItemResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "organizationId",
    "productId",
    "availableQuantity",
    "reservedQuantity",
    "minimumQuantity",
    "belowMinimum",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: idParamJsonProperty,
    organizationId: idParamJsonProperty,
    productId: idParamJsonProperty,
    availableQuantity: { type: "integer", minimum: 0 },
    reservedQuantity: { type: "integer", minimum: 0 },
    minimumQuantity: { type: "integer", minimum: 0 },
    belowMinimum: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const inventoryMovementResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "organizationId",
    "inventoryItemId",
    "productId",
    "type",
    "quantity",
    "reason",
    "createdByUserId",
    "createdAt",
  ],
  properties: {
    id: idParamJsonProperty,
    organizationId: idParamJsonProperty,
    inventoryItemId: idParamJsonProperty,
    productId: idParamJsonProperty,
    type: { type: "string", enum: inventoryMovementTypeValues },
    quantity: { type: "integer", minimum: 0 },
    reason: { type: ["string", "null"] },
    createdByUserId: { type: "string", minLength: 1 },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

export const inventoryMovementListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: inventoryMovementResponseSchema,
    },
  },
} as const;

export type ProductScopedParams = z.infer<typeof productScopedParamsSchema>;
export type CreateInventoryItemBody = z.infer<typeof createInventoryItemBodySchema>;
export type StockOperationBody = z.infer<typeof stockOperationBodySchema>;
export type AdjustStockBody = z.infer<typeof adjustStockBodySchema>;

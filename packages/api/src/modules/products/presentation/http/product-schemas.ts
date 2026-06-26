import { z } from "zod";
import { ProductCategory } from "../../domain/enums/ProductCategory.js";
import { ProductType } from "../../domain/enums/ProductType.js";
import { ProductUnit } from "../../domain/enums/ProductUnit.js";
import { StrainType } from "../../domain/enums/StrainType.js";

const nonBlankString = (field: string) => z.string().trim().min(1, `${field} is required.`);

const productCategoryValues = [
  ProductCategory.Flower,
  ProductCategory.Oil,
  ProductCategory.Extract,
  ProductCategory.Capsule,
  ProductCategory.Edible,
  ProductCategory.Topical,
  ProductCategory.Vaporizer,
  ProductCategory.Accessory,
  ProductCategory.Other,
] as const;

const productTypeValues = [
  ProductType.Cbd,
  ProductType.Thc,
  ProductType.Balanced,
  ProductType.FullSpectrum,
  ProductType.BroadSpectrum,
  ProductType.Isolate,
] as const;

const strainTypeValues = [StrainType.Indica, StrainType.Sativa, StrainType.Hybrid] as const;
const productUnitValues = [ProductUnit.Gram, ProductUnit.Milliliter, ProductUnit.Unit] as const;

const optionalDescriptionSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

const nullableNonnegativeNumberSchema = z.number().nonnegative().nullable().optional();

const productWriteBodySchema = z
  .object({
    name: nonBlankString("name"),
    description: optionalDescriptionSchema,
    category: z.enum(productCategoryValues),
    type: z.enum(productTypeValues),
    strainType: z.enum(strainTypeValues).nullable().optional(),
    thcPercentage: nullableNonnegativeNumberSchema,
    cbdPercentage: nullableNonnegativeNumberSchema,
    unit: z.enum(productUnitValues),
    priceInCents: z.number().int().nonnegative(),
  })
  .strict();

export const createProductBodySchema = productWriteBodySchema;
export const updateProductBodySchema = productWriteBodySchema;

export const organizationProductParamsSchema = z
  .object({
    organizationId: nonBlankString("organizationId"),
  })
  .strict();

export const productParamsSchema = organizationProductParamsSchema
  .extend({
    productId: nonBlankString("productId"),
  })
  .strict();

export const listProductsQuerySchema = z.object({}).strict();

const idParamJsonProperty = {
  type: "string",
  minLength: 1,
} as const;

export const organizationProductParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId"],
  properties: {
    organizationId: idParamJsonProperty,
  },
} as const;

export const productParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "productId"],
  properties: {
    organizationId: idParamJsonProperty,
    productId: idParamJsonProperty,
  },
} as const;

export const listProductsQueryJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {},
} as const;

export const productWriteBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "category", "type", "unit", "priceInCents"],
  properties: {
    name: { type: "string", minLength: 1 },
    description: { type: ["string", "null"] },
    category: { type: "string", enum: productCategoryValues },
    type: { type: "string", enum: productTypeValues },
    strainType: { type: ["string", "null"], enum: [...strainTypeValues, null] },
    thcPercentage: { type: ["number", "null"], minimum: 0 },
    cbdPercentage: { type: ["number", "null"], minimum: 0 },
    unit: { type: "string", enum: productUnitValues },
    priceInCents: { type: "integer", minimum: 0 },
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

export const productResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "organizationId",
    "name",
    "description",
    "category",
    "type",
    "strainType",
    "thcPercentage",
    "cbdPercentage",
    "unit",
    "priceInCents",
    "coverImageStorageKey",
    "coverImageUrl",
    "isActive",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: idParamJsonProperty,
    organizationId: idParamJsonProperty,
    name: { type: "string", minLength: 1 },
    description: { type: ["string", "null"] },
    category: { type: "string", enum: productCategoryValues },
    type: { type: "string", enum: productTypeValues },
    strainType: { type: ["string", "null"], enum: [...strainTypeValues, null] },
    thcPercentage: { type: ["number", "null"], minimum: 0 },
    cbdPercentage: { type: ["number", "null"], minimum: 0 },
    unit: { type: "string", enum: productUnitValues },
    priceInCents: { type: "integer", minimum: 0 },
    coverImageStorageKey: { type: ["string", "null"] },
    coverImageUrl: { type: ["string", "null"] },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

// Documentation-only body for the multipart cover-image upload, so Swagger
// renders a file picker. The handler reads the file via `request.file()` and
// skips JSON-schema body validation.
export const uploadProductCoverImageBodyJsonSchema = {
  type: "object",
  required: ["file"],
  properties: {
    file: { type: "string", format: "binary" },
  },
} as const;

export function createProductImageMetadataSchema(options: {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
}) {
  const allowed = options.allowedMimeTypes.map((mimeType) => mimeType.toLowerCase());

  return z.object({
    fileName: nonBlankString("fileName"),
    mimeType: z
      .string()
      .trim()
      .toLowerCase()
      .refine((value) => allowed.includes(value), "Unsupported image type."),
    size: z
      .number()
      .int()
      .positive()
      .max(options.maxSizeBytes, "Image size exceeds the configured limit."),
  });
}

export const productListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "array",
      items: productResponseSchema,
    },
  },
} as const;

export type CreateProductBody = z.infer<typeof createProductBodySchema>;
export type UpdateProductBody = z.infer<typeof updateProductBodySchema>;
export type OrganizationProductParams = z.infer<typeof organizationProductParamsSchema>;
export type ProductParams = z.infer<typeof productParamsSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

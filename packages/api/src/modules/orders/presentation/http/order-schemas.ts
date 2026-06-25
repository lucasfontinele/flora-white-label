import { z } from "zod";
import { OrderDeliveryType } from "../../domain/enums/OrderDeliveryType.js";
import { OrderStatus } from "../../domain/enums/OrderStatus.js";
import { PaymentMethod } from "../../domain/enums/PaymentMethod.js";
import { PaymentStatus } from "../../domain/enums/PaymentStatus.js";

const nonBlankString = (field: string) => z.string().trim().min(1, `${field} is required.`);

const orderDeliveryTypeValues = [OrderDeliveryType.Correios, OrderDeliveryType.Pickup] as const;

const orderStatusValues = [
  OrderStatus.Requested,
  OrderStatus.UnderReview,
  OrderStatus.InSeparation,
  OrderStatus.Approved,
  OrderStatus.ReadyForPickup,
  OrderStatus.Shipped,
  OrderStatus.Delivered,
  OrderStatus.Cancelled,
] as const;

const paymentMethodValues = [
  PaymentMethod.CreditCard,
  PaymentMethod.Boleto,
  PaymentMethod.Pix,
] as const;

const paymentStatusValues = [
  PaymentStatus.Pending,
  PaymentStatus.Expired,
  PaymentStatus.Cancelled,
  PaymentStatus.Paid,
  PaymentStatus.UnderDispute,
  PaymentStatus.Refunded,
  PaymentStatus.Redeemed,
  PaymentStatus.Approved,
  PaymentStatus.Failed,
] as const;

const optionalGuardianIdSchema = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null))
  .nullable()
  .optional();

export const createOrderBodySchema = z
  .object({
    patientId: nonBlankString("patientId"),
    guardianId: optionalGuardianIdSchema,
    deliveryType: z.enum(orderDeliveryTypeValues),
    items: z
      .array(
        z
          .object({
            productId: nonBlankString("productId"),
            quantity: z.number().int().positive(),
          })
          .strict(),
      )
      .min(1, "Order requires at least one item."),
  })
  .strict();

export const createPaymentBodySchema = z
  .object({
    paymentMethod: z.enum(paymentMethodValues),
    discount: z.number().min(0.01).max(1).nullable().optional(),
  })
  .strict();

export const organizationParamsSchema = z
  .object({
    organizationId: nonBlankString("organizationId"),
  })
  .strict();

// `status` is an optional comma-separated list of OrderStatus values, so a
// grouped UI filter (e.g. "awaiting review" = REQUESTED + UNDER_REVIEW) can be
// forwarded to the backend in a single query field.
export const listOrdersQuerySchema = z
  .object({
    status: z
      .string()
      .optional()
      .transform((value) =>
        value === undefined
          ? undefined
          : value
              .split(",")
              .map((entry) => entry.trim())
              .filter((entry) => entry.length > 0),
      )
      .pipe(z.array(z.enum(orderStatusValues)).optional()),
  })
  .strict();

export const orderParamsSchema = organizationParamsSchema
  .extend({
    orderId: nonBlankString("orderId"),
  })
  .strict();

export const paymentParamsSchema = orderParamsSchema
  .extend({
    paymentId: nonBlankString("paymentId"),
  })
  .strict();

const idParamJsonProperty = {
  type: "string",
  minLength: 1,
} as const;

export const organizationParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId"],
  properties: {
    organizationId: idParamJsonProperty,
  },
} as const;

export const orderParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "orderId"],
  properties: {
    organizationId: idParamJsonProperty,
    orderId: idParamJsonProperty,
  },
} as const;

export const listOrdersQueryJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: {
      type: "string",
      description: "Comma-separated list of OrderStatus values to filter by.",
    },
  },
} as const;

export const paymentParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "orderId", "paymentId"],
  properties: {
    organizationId: idParamJsonProperty,
    orderId: idParamJsonProperty,
    paymentId: idParamJsonProperty,
  },
} as const;

export const createOrderBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["patientId", "deliveryType", "items"],
  properties: {
    patientId: { type: "string", minLength: 1 },
    guardianId: { type: ["string", "null"] },
    deliveryType: { type: "string", enum: orderDeliveryTypeValues },
    items: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["productId", "quantity"],
        properties: {
          productId: { type: "string", minLength: 1 },
          quantity: { type: "integer", minimum: 1 },
        },
      },
    },
  },
} as const;

export const createPaymentBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["paymentMethod"],
  properties: {
    paymentMethod: { type: "string", enum: paymentMethodValues },
    discount: { type: ["number", "null"], minimum: 0.01, maximum: 1 },
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

const orderItemResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "orderId", "productId", "productName", "unitPrice", "quantity"],
  properties: {
    id: idParamJsonProperty,
    orderId: idParamJsonProperty,
    productId: idParamJsonProperty,
    productName: { type: "string" },
    unitPrice: { type: "integer", minimum: 0 },
    quantity: { type: "integer", minimum: 1 },
  },
} as const;

export const orderResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "organizationId",
    "token",
    "patientId",
    "patientName",
    "guardianId",
    "guardianName",
    "status",
    "deliveryType",
    "itemsAmount",
    "items",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: idParamJsonProperty,
    organizationId: idParamJsonProperty,
    token: { type: "string", minLength: 1 },
    patientId: idParamJsonProperty,
    patientName: { type: "string" },
    guardianId: { type: ["string", "null"] },
    guardianName: { type: ["string", "null"] },
    status: { type: "string", enum: orderStatusValues },
    deliveryType: { type: "string", enum: orderDeliveryTypeValues },
    itemsAmount: { type: "integer", minimum: 0 },
    items: { type: "array", items: orderItemResponseSchema },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const orderListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: { type: "array", items: orderResponseSchema },
  },
} as const;

export const orderPaymentResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "orderId",
    "totalPaid",
    "discount",
    "paymentMethod",
    "status",
    "externalPaymentId",
    "checkoutUrl",
    "pixQrCode",
    "pixQrCodeBase64",
    "expiresAt",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: idParamJsonProperty,
    orderId: idParamJsonProperty,
    totalPaid: { type: "integer", minimum: 0 },
    discount: { type: ["number", "null"], minimum: 0.01, maximum: 1 },
    paymentMethod: { type: "string", enum: paymentMethodValues },
    status: { type: "string", enum: paymentStatusValues },
    externalPaymentId: { type: ["string", "null"] },
    checkoutUrl: { type: ["string", "null"] },
    pixQrCode: { type: ["string", "null"] },
    pixQrCodeBase64: { type: ["string", "null"] },
    expiresAt: { type: ["string", "null"], format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const orderPaymentListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: { type: "array", items: orderPaymentResponseSchema },
  },
} as const;

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;
export type CreatePaymentBody = z.infer<typeof createPaymentBodySchema>;
export type OrganizationParams = z.infer<typeof organizationParamsSchema>;
export type OrderParams = z.infer<typeof orderParamsSchema>;
export type PaymentParams = z.infer<typeof paymentParamsSchema>;

import { z } from "zod";

const nonBlankString = (field: string) => z.string().trim().min(1, `${field} is required.`);

export const operationalDashboardParamsSchema = z
  .object({
    organizationId: nonBlankString("organizationId"),
  })
  .strict();

export const operationalDashboardParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId"],
  properties: {
    organizationId: { type: "string", minLength: 1 },
  },
} as const;

export const operationalDashboardQuerySchema = z
  .object({
    employeeId: nonBlankString("employeeId"),
  })
  .strict();

export const operationalDashboardQueryJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["employeeId"],
  properties: {
    employeeId: { type: "string", minLength: 1 },
  },
} as const;

const ORDER_STATUSES = [
  "Solicitado",
  "Em análise",
  "Aprovado",
  "Em separação",
  "Pronto para retirada",
  "Enviado",
  "Entregue",
] as const;

export const operationalDashboardResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: {
      type: "object",
      additionalProperties: false,
      required: ["lowStock", "metrics", "ordersByStatus", "referenceLabel"],
      properties: {
        metrics: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["delta", "hint", "icon", "label", "value"],
            properties: {
              delta: { type: "string" },
              hint: { type: "string" },
              icon: { type: "string" },
              label: { type: "string" },
              tone: { type: "string", enum: ["success", "error"] },
              value: { type: "string" },
            },
          },
        },
        ordersByStatus: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["count", "status"],
            properties: {
              count: { type: "integer", minimum: 0 },
              status: { type: "string", enum: ORDER_STATUSES },
            },
          },
        },
        lowStock: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["amount", "name", "tone"],
            properties: {
              amount: { type: "string" },
              name: { type: "string" },
              tone: { type: "string", enum: ["success", "warning", "error"] },
            },
          },
        },
        referenceLabel: { type: "string" },
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

export type OperationalDashboardParams = z.infer<typeof operationalDashboardParamsSchema>;
export type OperationalDashboardQuery = z.infer<typeof operationalDashboardQuerySchema>;

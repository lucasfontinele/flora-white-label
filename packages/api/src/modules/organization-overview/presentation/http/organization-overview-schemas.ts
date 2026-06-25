import { z } from "zod";

const nonBlankString = (field: string) => z.string().trim().min(1, `${field} is required.`);

export const organizationOverviewParamsSchema = z
  .object({
    organizationId: nonBlankString("organizationId"),
  })
  .strict();

export const organizationOverviewParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId"],
  properties: {
    organizationId: { type: "string", minLength: 1 },
  },
} as const;

export const organizationOverviewResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["ordersCount", "pendingApprovalsCount"],
  properties: {
    ordersCount: { type: "integer", minimum: 0 },
    pendingApprovalsCount: { type: "integer", minimum: 0 },
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

export type OrganizationOverviewParams = z.infer<typeof organizationOverviewParamsSchema>;

import { z } from "zod";

const idParam = { type: "string", minLength: 1 } as const;

export const organizationParamsSchema = z
  .object({ organizationId: z.string().trim().min(1, "organizationId is required.") })
  .strict();

export const associateAccessParamsSchema = organizationParamsSchema
  .extend({ userId: z.string().trim().min(1, "userId is required.") })
  .strict();

export const listAssociatesQuerySchema = z
  .object({
    search: z.string().trim().min(1).optional(),
    type: z.enum(["GUARDIAN", "PATIENT"]).optional(),
    status: z.enum(["active", "disabled"]).optional(),
  })
  .strict();

export const setUserAccessBodySchema = z
  .object({ isActive: z.boolean() })
  .strict();

export const organizationParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId"],
  properties: { organizationId: idParam },
} as const;

export const associateAccessParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "userId"],
  properties: { organizationId: idParam, userId: idParam },
} as const;

export const listAssociatesQueryJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    search: { type: "string" },
    type: { type: "string", enum: ["GUARDIAN", "PATIENT"] },
    status: { type: "string", enum: ["active", "disabled"] },
  },
} as const;

export const setUserAccessBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["isActive"],
  properties: { isActive: { type: "boolean" } },
} as const;

export const associateResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["userId", "email", "type", "name", "patientNames", "isActive", "createdAt"],
  properties: {
    userId: idParam,
    email: { type: "string" },
    type: { type: "string", enum: ["GUARDIAN", "PATIENT"] },
    name: { type: "string" },
    patientNames: { type: "array", items: { type: "string" } },
    isActive: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

export const associateListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: { data: { type: "array", items: associateResponseSchema } },
} as const;

export const userAccessResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["userId", "isActive"],
  properties: { userId: idParam, isActive: { type: "boolean" } },
} as const;

export const errorResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["error", "message"],
  properties: { error: { type: "string" }, message: { type: "string" } },
} as const;

export type ListAssociatesQuery = z.infer<typeof listAssociatesQuerySchema>;
export type SetUserAccessBody = z.infer<typeof setUserAccessBodySchema>;

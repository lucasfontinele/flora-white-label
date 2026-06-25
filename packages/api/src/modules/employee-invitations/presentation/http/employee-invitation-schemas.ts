import { z } from "zod";
import { InvitationStatus } from "../../domain/enums/InvitationStatus.js";

const nonBlankString = (field: string) => z.string().trim().min(1, `${field} is required.`);

const invitationStatusValues = [
  InvitationStatus.Pending,
  InvitationStatus.Accepted,
  InvitationStatus.Expired,
  InvitationStatus.Revoked,
] as const;

export const organizationParamsSchema = z
  .object({
    organizationId: nonBlankString("organizationId"),
  })
  .strict();

export const invitationParamsSchema = organizationParamsSchema
  .extend({
    invitationId: nonBlankString("invitationId"),
  })
  .strict();

export const tokenParamsSchema = z
  .object({
    token: nonBlankString("token"),
  })
  .strict();

export const sendInvitationBodySchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email."),
    roleId: nonBlankString("roleId"),
  })
  .strict();

export const acceptInvitationBodySchema = z
  .object({
    fullName: nonBlankString("fullName"),
    document: nonBlankString("document"),
    password: z.string().min(8, "Password must be at least 8 characters."),
  })
  .strict();

const idParamJsonProperty = { type: "string", minLength: 1 } as const;

export const organizationParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId"],
  properties: { organizationId: idParamJsonProperty },
} as const;

export const invitationParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId", "invitationId"],
  properties: {
    organizationId: idParamJsonProperty,
    invitationId: idParamJsonProperty,
  },
} as const;

export const tokenParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["token"],
  properties: { token: idParamJsonProperty },
} as const;

export const sendInvitationBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["email", "roleId"],
  properties: {
    email: { type: "string", format: "email", minLength: 3 },
    roleId: idParamJsonProperty,
  },
} as const;

export const acceptInvitationBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["fullName", "document", "password"],
  properties: {
    fullName: { type: "string", minLength: 1 },
    document: { type: "string", minLength: 1 },
    password: { type: "string", minLength: 8 },
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

export const invitationResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "organizationId",
    "email",
    "roleId",
    "roleName",
    "status",
    "expiresAt",
    "acceptedAt",
    "createdAt",
  ],
  properties: {
    id: idParamJsonProperty,
    organizationId: idParamJsonProperty,
    email: { type: "string" },
    roleId: idParamJsonProperty,
    roleName: { type: "string" },
    status: { type: "string", enum: invitationStatusValues },
    expiresAt: { type: "string", format: "date-time" },
    acceptedAt: { type: ["string", "null"], format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
  },
} as const;

export const invitationListResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["data"],
  properties: {
    data: { type: "array", items: invitationResponseSchema },
  },
} as const;

export const invitationTokenResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "organizationId",
    "organizationName",
    "email",
    "roleId",
    "roleName",
    "status",
    "expiresAt",
    "isAcceptable",
  ],
  properties: {
    organizationId: idParamJsonProperty,
    organizationName: { type: "string" },
    email: { type: "string" },
    roleId: idParamJsonProperty,
    roleName: { type: "string" },
    status: { type: "string", enum: invitationStatusValues },
    expiresAt: { type: "string", format: "date-time" },
    isAcceptable: { type: "boolean" },
  },
} as const;

export const acceptInvitationResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["userId", "organizationEmployeeId", "email"],
  properties: {
    userId: idParamJsonProperty,
    organizationEmployeeId: idParamJsonProperty,
    email: { type: "string" },
  },
} as const;

export type OrganizationParams = z.infer<typeof organizationParamsSchema>;
export type InvitationParams = z.infer<typeof invitationParamsSchema>;
export type TokenParams = z.infer<typeof tokenParamsSchema>;
export type SendInvitationBody = z.infer<typeof sendInvitationBodySchema>;
export type AcceptInvitationBody = z.infer<typeof acceptInvitationBodySchema>;

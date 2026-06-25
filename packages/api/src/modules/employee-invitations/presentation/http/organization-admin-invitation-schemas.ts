import { z } from "zod";

export const adminInvitationParamsSchema = z
  .object({
    organizationId: z.string().trim().min(1, "organizationId is required."),
  })
  .strict();

export const sendAdminInvitationBodySchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email."),
  })
  .strict();

/** The requester identity is carried in the `x-master-user-id` header. */
export const adminInvitationHeadersSchema = z
  .object({
    "x-master-user-id": z.string().trim().min(1).optional(),
  })
  .passthrough();

const idParamJsonProperty = { type: "string", minLength: 1 } as const;

export const adminInvitationParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId"],
  properties: { organizationId: idParamJsonProperty },
} as const;

export const sendAdminInvitationBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["email"],
  properties: {
    email: { type: "string", format: "email", minLength: 3 },
  },
} as const;

export type AdminInvitationParams = z.infer<typeof adminInvitationParamsSchema>;
export type SendAdminInvitationBody = z.infer<typeof sendAdminInvitationBodySchema>;

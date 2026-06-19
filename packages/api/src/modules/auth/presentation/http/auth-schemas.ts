import { z } from "zod";

export const loginBodySchema = z
  .object({
    email: z.string().trim().email("email must be valid.").transform((value) => value.toLowerCase()),
    password: z.string().refine((value) => value.trim().length > 0, {
      message: "password is required.",
    }),
  })
  .strict();

export const loginBodyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["email", "password"],
  properties: {
    email: {
      type: "string",
      format: "email",
      minLength: 1,
    },
    password: {
      type: "string",
      minLength: 1,
    },
  },
} as const;

export const errorResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["error", "message"],
  properties: {
    error: {
      type: "string",
    },
    message: {
      type: "string",
    },
  },
} as const;

export const authUserResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "email", "profile", "organizationId", "guardianId", "patientId"],
  properties: {
    id: {
      type: "string",
      minLength: 1,
    },
    email: {
      type: "string",
      format: "email",
    },
    profile: {
      type: "string",
      enum: ["Master", "Organization", "Patient", "Guardian"],
    },
    organizationId: {
      type: "string",
      minLength: 1,
    },
    guardianId: {
      type: ["string", "null"],
    },
    patientId: {
      type: ["string", "null"],
    },
  },
} as const;

export const authContextResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["view", "organizationId", "guardianId", "patientId"],
  properties: {
    view: {
      type: "string",
      enum: ["BackofficeMaster", "Organization", "PatientPortal"],
    },
    organizationId: {
      type: "string",
      minLength: 1,
    },
    guardianId: {
      type: ["string", "null"],
    },
    patientId: {
      type: ["string", "null"],
    },
  },
} as const;

export const loginResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["accessToken", "user", "context"],
  properties: {
    accessToken: {
      type: "string",
      minLength: 1,
    },
    user: authUserResponseSchema,
    context: authContextResponseSchema,
  },
} as const;

export type LoginBody = z.infer<typeof loginBodySchema>;

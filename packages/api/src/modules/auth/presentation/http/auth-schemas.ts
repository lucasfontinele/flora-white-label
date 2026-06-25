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
  required: ["id", "email", "profile", "organizationId", "patientId"],
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
      type: "string",
    },
    patientId: {
      type: ["string", "null"],
    },
    organizationEmployeeId: {
      type: "string",
    },
  },
} as const;

export const authEmployeeContextResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "fullName", "document", "isActive"],
  properties: {
    id: {
      type: "string",
      minLength: 1,
    },
    fullName: {
      type: "string",
      minLength: 1,
    },
    document: {
      type: "string",
      minLength: 1,
    },
    isActive: {
      type: "boolean",
    },
  },
} as const;

export const authGuardianContextResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "document"],
  properties: {
    id: {
      type: "string",
      minLength: 1,
    },
    name: {
      type: "string",
      minLength: 1,
    },
    document: {
      type: "string",
      minLength: 1,
    },
  },
} as const;

export const authPatientContextResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "name", "document", "relationshipLabel", "underPrivileged"],
  properties: {
    id: {
      type: "string",
      minLength: 1,
    },
    name: {
      type: "string",
      minLength: 1,
    },
    document: {
      type: "string",
      minLength: 1,
    },
    relationshipLabel: {
      type: "string",
      minLength: 1,
    },
    underPrivileged: {
      type: "boolean",
    },
  },
} as const;

export const authOrganizationContextResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "tradeName",
    "legalName",
    "slug",
    "logoUrl",
    "primaryColor",
    "secondaryColor",
  ],
  properties: {
    id: {
      type: "string",
      minLength: 1,
    },
    tradeName: {
      type: "string",
      minLength: 1,
    },
    legalName: {
      type: "string",
      minLength: 1,
    },
    slug: {
      type: "string",
      minLength: 1,
    },
    logoUrl: {
      type: ["string", "null"],
    },
    primaryColor: {
      type: ["string", "null"],
    },
    secondaryColor: {
      type: ["string", "null"],
    },
  },
} as const;

export const authContextResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "view",
    "organizationId",
    "patientId",
    "organization",
    "guardian",
    "patient",
    "employee",
    "managedPatients",
  ],
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
      type: "string",
    },
    patientId: {
      type: ["string", "null"],
    },
    organizationEmployeeId: {
      type: "string",
    },
    organization: {
      anyOf: [authOrganizationContextResponseSchema, { type: "null" }],
    },
    guardian: {
      anyOf: [authGuardianContextResponseSchema, { type: "null" }],
    },
    patient: {
      anyOf: [authPatientContextResponseSchema, { type: "null" }],
    },
    employee: {
      anyOf: [authEmployeeContextResponseSchema, { type: "null" }],
    },
    managedPatients: {
      type: "array",
      items: authPatientContextResponseSchema,
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

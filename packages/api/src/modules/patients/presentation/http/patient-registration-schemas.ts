import { z } from "zod";
import { isValidBrazilianState } from "../../../addresses/domain/brazilian-states.js";
import { RegistrationType } from "../../domain/enums/RegistrationType.js";

const genderCodeSchema = z.enum(["M", "F", "O", "N/A"]);

const prescriberSchema = z
  .object({
    fullName: z.string().trim().min(1, "prescriber fullName is required."),
    crm: z.string().trim().min(1, "prescriber crm is required."),
    crmState: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .refine((value) => isValidBrazilianState(value), "prescriber crmState must be a valid UF."),
  })
  .strict();

const prescribersSchema = z
  .array(prescriberSchema)
  .min(1, "At least one prescriber is required.");

const userSchema = z
  .object({
    email: z.string().trim().email("email must be valid.").transform((value) => value.toLowerCase()),
    password: z.string().refine((value) => value.trim().length > 0, {
      message: "password is required.",
    }),
  })
  .strict();

const personSchema = z
  .object({
    name: z.string().trim().min(1, "name is required."),
    document: z.string().trim().min(1, "document is required."),
    birthdate: z.coerce.date(),
    gender: genderCodeSchema,
  })
  .strict();

const patientSchema = personSchema.extend({
  underPrivileged: z.boolean(),
});

const patientRegistrationBodySchema = z
  .object({
    registrationType: z.literal(RegistrationType.Patient),
    user: userSchema,
    patient: patientSchema,
    prescribers: prescribersSchema,
  })
  .strict();

const legalGuardianRegistrationBodySchema = z
  .object({
    registrationType: z.literal(RegistrationType.LegalGuardian),
    user: userSchema,
    guardian: personSchema,
    patient: patientSchema,
    prescribers: prescribersSchema,
  })
  .strict();

const petTutorRegistrationBodySchema = z
  .object({
    registrationType: z.literal(RegistrationType.PetTutor),
    user: userSchema,
    guardian: personSchema,
  })
  .strict();

export const patientRegistrationParamsSchema = z
  .object({
    organizationId: z.string().trim().min(1, "organizationId is required."),
  })
  .strict();

export const patientRegistrationBodySchemaDiscriminated = z.discriminatedUnion(
  "registrationType",
  [
    patientRegistrationBodySchema,
    legalGuardianRegistrationBodySchema,
    petTutorRegistrationBodySchema,
  ],
);

const userJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email", minLength: 1 },
    password: { type: "string", minLength: 1 },
  },
} as const;

const personJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "document", "birthdate", "gender"],
  properties: {
    name: { type: "string", minLength: 1 },
    document: { type: "string", minLength: 1 },
    birthdate: { type: "string", format: "date" },
    gender: { type: "string", enum: ["M", "F", "O", "N/A"] },
  },
} as const;

const patientJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "document", "birthdate", "gender", "underPrivileged"],
  properties: {
    ...personJsonSchema.properties,
    underPrivileged: { type: "boolean" },
  },
} as const;

const prescriberJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["fullName", "crm", "crmState"],
  properties: {
    fullName: { type: "string", minLength: 1 },
    crm: { type: "string", minLength: 1 },
    crmState: { type: "string", minLength: 2, maxLength: 2 },
  },
} as const;

const prescribersJsonSchema = {
  type: "array",
  minItems: 1,
  items: prescriberJsonSchema,
} as const;

export const patientRegistrationParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["organizationId"],
  properties: {
    organizationId: { type: "string", minLength: 1 },
  },
} as const;

// NOTE: the branches intentionally omit `additionalProperties: false` at the
// top level. Fastify's AJV defaults to `removeAdditional: true`, and inside a
// `oneOf` that strips the data while testing each branch — e.g. validating a
// LegalGuardian body against the Patient branch would delete `guardian`, then
// the LegalGuardian branch fails for a missing `guardian` and the whole `oneOf`
// is rejected. The `const` discriminator already makes the branches mutually
// exclusive, and the Zod schema above enforces strictness on the parsed body.
export const patientRegistrationBodyJsonSchema = {
  oneOf: [
    {
      type: "object",
      required: ["registrationType", "user", "patient", "prescribers"],
      properties: {
        registrationType: { const: RegistrationType.Patient },
        user: userJsonSchema,
        patient: patientJsonSchema,
        prescribers: prescribersJsonSchema,
      },
    },
    {
      type: "object",
      required: ["registrationType", "user", "guardian", "patient", "prescribers"],
      properties: {
        registrationType: { const: RegistrationType.LegalGuardian },
        user: userJsonSchema,
        guardian: personJsonSchema,
        patient: patientJsonSchema,
        prescribers: prescribersJsonSchema,
      },
    },
    {
      type: "object",
      required: ["registrationType", "user", "guardian"],
      properties: {
        registrationType: { const: RegistrationType.PetTutor },
        user: userJsonSchema,
        guardian: personJsonSchema,
      },
    },
  ],
} as const;

export const patientRegistrationResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["userId", "guardianId", "patientId", "registrationType"],
  properties: {
    userId: { type: "string", minLength: 1 },
    guardianId: { type: ["string", "null"] },
    patientId: { type: ["string", "null"] },
    registrationType: {
      type: "string",
      enum: [RegistrationType.PetTutor, RegistrationType.LegalGuardian, RegistrationType.Patient],
    },
  },
} as const;

export const patientRegistrationErrorResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["error", "message"],
  properties: {
    error: { type: "string" },
    message: { type: "string" },
  },
} as const;

export type PatientRegistrationParams = z.infer<typeof patientRegistrationParamsSchema>;
export type PatientRegistrationBody = z.infer<typeof patientRegistrationBodySchemaDiscriminated>;

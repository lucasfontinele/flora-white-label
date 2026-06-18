import { z } from "zod";

export const zipcodeParamsSchema = z
  .object({
    zipcode: z
      .string()
      .trim()
      .refine((value) => value.replace(/\D/g, "").length === 8, "zipcode must have exactly 8 digits."),
  })
  .strict();

export const zipcodeParamsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["zipcode"],
  properties: {
    zipcode: { type: "string", minLength: 8, maxLength: 9 },
  },
} as const;

export const zipcodeAddressResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["zipcode", "street", "complement", "neighborhood", "city", "state"],
  properties: {
    zipcode: { type: "string", pattern: "^\\d{8}$" },
    street: { type: "string" },
    complement: { type: ["string", "null"] },
    neighborhood: { type: "string" },
    city: { type: "string" },
    state: { type: "string", minLength: 2, maxLength: 2 },
  },
} as const;

export const validationErrorResponseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["error", "message"],
  properties: {
    error: { type: "string" },
    message: { type: "string" },
  },
} as const;

export type ZipcodeParams = z.infer<typeof zipcodeParamsSchema>;

import { z } from "zod";
import { isValidCnae, onlyDigits } from "@/lib/masks";
import type { OrganizationWriteBody } from "../types";

const requiredText = (message: string) => z.string().trim().min(1, message);

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : ""));

const cnaeSchema = z
  .string()
  .refine(isValidCnae, "Informe um CNAE válido.")
  .transform(onlyDigits);

const addressSchema = z.object({
  title: optionalText,
  zipcode: z
    .string()
    .refine((value) => onlyDigits(value).length === 8, "Informe um CEP válido.")
    .transform(onlyDigits),
  street: requiredText("Informe o logradouro."),
  number: optionalText,
  complement: optionalText,
  neighborhood: requiredText("Informe o bairro."),
  city: requiredText("Informe a cidade."),
  state: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => /^[A-Z]{2}$/.test(value), "Informe a UF."),
});

const organizationSchema = z.object({
  legalName: requiredText("Informe a razão social."),
  tradeName: requiredText("Informe o nome fantasia."),
  cnpj: z
    .string()
    .refine((value) => onlyDigits(value).length === 14, "Informe um CNPJ válido.")
    .transform(onlyDigits),
  primaryCnae: cnaeSchema,
  secondaryCnaes: z
    .array(cnaeSchema)
    .optional()
    .default([])
    .superRefine((value, context) => {
      if (new Set(value).size !== value.length) {
        context.addIssue({
          code: "custom",
          message: "Não informe CNAEs secundários duplicados.",
        });
      }
    }),
});

export const organizationRegistrationSchema = z.object({
  organization: organizationSchema,
  address: addressSchema,
  currentPlanId: requiredText("Selecione um plano."),
});

export type OrganizationRegistrationFormValues = z.input<typeof organizationRegistrationSchema>;
export type OrganizationRegistrationSchema = z.output<typeof organizationRegistrationSchema>;

export const organizationRegistrationDefaultValues: OrganizationRegistrationFormValues = {
  organization: {
    legalName: "",
    tradeName: "",
    cnpj: "",
    primaryCnae: "",
    secondaryCnaes: [],
  },
  address: {
    title: "",
    zipcode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  },
  currentPlanId: "",
};

export const organizationRegistrationStepFields = {
  organization: [
    "organization.legalName",
    "organization.tradeName",
    "organization.cnpj",
    "organization.primaryCnae",
    "organization.secondaryCnaes",
  ],
  address: [
    "address.title",
    "address.zipcode",
    "address.street",
    "address.number",
    "address.complement",
    "address.neighborhood",
    "address.city",
    "address.state",
  ],
  plan: ["currentPlanId"],
} as const;

/**
 * Maps the validated form output to the API write body. The street number is a
 * UI-only field (the API has no dedicated column), so it is appended to the
 * street when provided.
 */
export function toOrganizationWriteBody(values: OrganizationRegistrationSchema): OrganizationWriteBody {
  const number = values.address.number.trim();
  const street = number ? `${values.address.street}, ${number}` : values.address.street;

  return {
    organization: {
      tradeName: values.organization.tradeName,
      legalName: values.organization.legalName,
      cnpj: values.organization.cnpj,
      primaryCnae: values.organization.primaryCnae,
      secondaryCnaes: values.organization.secondaryCnaes,
      currentPlanId: values.currentPlanId,
    },
    address: {
      title: values.address.title.trim() ? values.address.title.trim() : null,
      zipcode: values.address.zipcode,
      street,
      neighborhood: values.address.neighborhood,
      complement: values.address.complement.trim() ? values.address.complement.trim() : null,
      city: values.address.city,
      state: values.address.state,
    },
  };
}

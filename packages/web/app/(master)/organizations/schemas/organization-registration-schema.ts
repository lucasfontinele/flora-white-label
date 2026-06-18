import type { CreateOrganizationRequest } from "@flora/shared/organizations";
import { isValidCnae, onlyDigits } from "@/lib/masks";
import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);



const cnaeSchema = z
  .string()
  .refine(isValidCnae, "Informe um CNAE válido.")
  .transform(onlyDigits);

const addressSchema = z.object({
  cep: z
    .string()
    .refine((value) => onlyDigits(value).length === 8, "Informe um CEP válido.")
    .transform(onlyDigits),
  city: requiredText("Informe a cidade."),
  complement: z.string().optional(),
  logradouro: requiredText("Informe o logradouro."),
  neighborhood: requiredText("Informe o bairro."),
  number: requiredText("Informe o número."),
  state: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => /^[A-Z]{2}$/.test(value), "Informe a UF."),
});

const companySchema = z.object({
  cnpj: z
    .string()
    .refine((value) => onlyDigits(value).length === 14, "Informe um CNPJ válido.")
    .transform(onlyDigits),
  foundationDate: requiredText("Informe a data de fundação.").refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return false;

    return date <= new Date();
  }, "Data de fundação não pode ser futura."),
  legalName: requiredText("Informe a razão social."),
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
  tradeName: requiredText("Informe o nome fantasia."),
});

export const organizationRegistrationSchema = z.object({
  address: addressSchema,
  company: companySchema,
  subscriptionPlanId: requiredText("Selecione um plano."),
});

export const organizationRegistrationDefaultValues: CreateOrganizationRequest = {
  address: {
    cep: "",
    city: "",
    complement: "",
    logradouro: "",
    neighborhood: "",
    number: "",
    state: "",
  },
  company: {
    cnpj: "",
    foundationDate: "",
    legalName: "",
    primaryCnae: "",
    secondaryCnaes: [],
    tradeName: "",
  },
  subscriptionPlanId: "",
};

export const organizationRegistrationStepFields = {
  address: [
    "address.cep",
    "address.logradouro",
    "address.number",
    "address.complement",
    "address.neighborhood",
    "address.city",
    "address.state",
  ],
  company: [
    "company.legalName",
    "company.tradeName",
    "company.cnpj",
    "company.foundationDate",
    "company.primaryCnae",
    "company.secondaryCnaes",
  ],
  plan: ["subscriptionPlanId"],
} as const;

export type OrganizationRegistrationFormValues = z.input<typeof organizationRegistrationSchema>;
export type OrganizationRegistrationSchema = z.output<typeof organizationRegistrationSchema>;
type _EnsuresSharedContract = OrganizationRegistrationSchema extends CreateOrganizationRequest ? true : never;

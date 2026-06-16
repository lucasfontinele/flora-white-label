import type { CreateOrganizationRequest } from "@flora/shared/organizations";
import { isValidCnae, onlyDigits } from "@/lib/masks";
import { z } from "zod";

const requiredText = (message: string) => z.string().trim().min(1, message);

const optionalUrl = (label: string) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().url(`${label} deve ser uma URL válida.`).optional(),
  );

const optionalPhone = z
  .string()
  .optional()
  .transform((value) => onlyDigits(value ?? ""))
  .refine((value) => value.length === 0 || value.length === 10 || value.length === 11, "Informe um telefone válido.")
  .transform((value) => value || undefined);

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
  facebook: optionalUrl("Facebook"),
  foundationDate: requiredText("Informe a data de fundação.").refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return false;

    return date <= new Date();
  }, "Data de fundação não pode ser futura."),
  instagram: optionalUrl("Instagram"),
  institutionalEmail: z.string().email("Informe um e-mail institucional válido."),
  linkedin: optionalUrl("LinkedIn"),
  legalName: requiredText("Informe a razão social."),
  phone: optionalPhone,
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
  site: optionalUrl("Site"),
  tradeName: requiredText("Informe o nome fantasia."),
  whatsapp: z
    .string()
    .refine((value) => {
      const length = onlyDigits(value).length;
      return length === 10 || length === 11;
    }, "Informe um WhatsApp válido.")
    .transform(onlyDigits),
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
    facebook: "",
    foundationDate: "",
    instagram: "",
    institutionalEmail: "",
    linkedin: "",
    legalName: "",
    phone: "",
    primaryCnae: "",
    secondaryCnaes: [],
    site: "",
    tradeName: "",
    whatsapp: "",
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
    "company.institutionalEmail",
    "company.phone",
    "company.whatsapp",
    "company.site",
    "company.instagram",
    "company.facebook",
    "company.linkedin",
  ],
  plan: ["subscriptionPlanId"],
} as const;

export type OrganizationRegistrationFormValues = z.input<typeof organizationRegistrationSchema>;
export type OrganizationRegistrationSchema = z.output<typeof organizationRegistrationSchema>;
type _EnsuresSharedContract = OrganizationRegistrationSchema extends CreateOrganizationRequest ? true : never;

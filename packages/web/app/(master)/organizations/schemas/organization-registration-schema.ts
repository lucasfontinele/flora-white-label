import { z } from "zod";

const digits = (value: string) => value.replace(/\D/g, "");

const requiredText = (message: string) => z.string().trim().min(1, message);

const addressSchema = z.object({
  cep: z.string().refine((value) => digits(value).length === 8, "Informe um CEP válido."),
  city: requiredText("Informe a cidade."),
  complement: z.string().optional(),
  logradouro: requiredText("Informe o logradouro."),
  neighborhood: requiredText("Informe o bairro."),
  number: requiredText("Informe o número."),
  state: z.string().trim().length(2, "Informe a UF."),
});

export const organizationRegistrationSchema = z.object({
  address: addressSchema,
  company: z.object({
    cnpj: z.string().refine((value) => digits(value).length === 14, "Informe um CNPJ válido."),
    foundationDate: requiredText("Informe a data de fundação."),
    institutionalEmail: z.string().email("Informe um e-mail institucional válido."),
    legalName: requiredText("Informe a razão social."),
    primaryCnae: requiredText("Informe o CNAE principal."),
    secondaryCnaes: z.array(z.string().trim().min(1)).optional().default([]),
    tradeName: requiredText("Informe o nome fantasia."),
    whatsapp: z.string().refine((value) => {
      const length = digits(value).length;
      return length === 10 || length === 11;
    }, "Informe um WhatsApp válido."),
  }),
  subscriptionPlanId: requiredText("Selecione um plano."),
});

export type OrganizationRegistrationSchema = z.infer<typeof organizationRegistrationSchema>;

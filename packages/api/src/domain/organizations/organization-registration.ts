import { ValidationException } from "../../exception/index.js";
import { createAddress, type AddressInput } from "../addresses/address.js";
import {
  isFutureDate,
  isValidBrazilianPhone,
  isValidCnae,
  isValidCnpj,
  isValidEmail,
  isValidUrl,
  normalizeCnae,
  normalizeCnpj,
  normalizePhone,
  normalizeText,
  parseDateOnly,
} from "../shared/validation.js";
import type { OrganizationCompanyData } from "./organization.js";

export type OrganizationRegistrationInput = {
  address: AddressInput;
  company: {
    cnpj: string;
    facebook?: string;
    foundationDate: string;
    instagram?: string;
    institutionalEmail: string;
    linkedin?: string;
    legalName: string;
    phone?: string;
    primaryCnae: string;
    secondaryCnaes?: string[];
    site?: string;
    tradeName: string;
    whatsapp: string;
  };
  subscriptionPlanId: string;
};

export type ParsedOrganizationRegistrationInput = {
  address: ReturnType<typeof createAddress>;
  company: OrganizationCompanyData;
  subscriptionPlanId: string;
};

type ParseOptions = {
  now?: Date;
};

export function parseOrganizationRegistrationInput(
  input: unknown,
  options: ParseOptions = {},
): ParsedOrganizationRegistrationInput {
  if (!isRecord(input) || !isRecord(input.company) || !isRecord(input.address)) {
    throw new ValidationException("Cadastro de organização inválido.");
  }

  const issues: string[] = [];
  const company = input.company;
  const foundationDateValue = readString(company.foundationDate);
  const foundationDate = foundationDateValue ? parseDateOnly(foundationDateValue) : null;
  const secondaryCnaesInput = Array.isArray(company.secondaryCnaes) ? company.secondaryCnaes : [];
  const secondaryCnaes = secondaryCnaesInput
    .map((value) => normalizeCnae(String(value)))
    .filter(Boolean);

  const normalizedCompany = {
    cnpj: normalizeCnpj(readString(company.cnpj)),
    facebook: optionalString(company.facebook),
    foundationDate,
    instagram: optionalString(company.instagram),
    institutionalEmail: normalizeText(readString(company.institutionalEmail)),
    linkedin: optionalString(company.linkedin),
    legalName: normalizeText(readString(company.legalName)),
    phone: optionalPhone(company.phone),
    primaryCnae: normalizeCnae(readString(company.primaryCnae)),
    secondaryCnaes,
    site: optionalString(company.site),
    tradeName: normalizeText(readString(company.tradeName)),
    whatsapp: normalizePhone(readString(company.whatsapp)),
  };

  if (!normalizedCompany.legalName) issues.push("Razão social obrigatória.");
  if (!normalizedCompany.tradeName) issues.push("Nome fantasia obrigatório.");
  if (!isValidCnpj(normalizedCompany.cnpj)) issues.push("CNPJ inválido.");
  if (!foundationDate) issues.push("Data de fundação inválida.");
  if (foundationDate && isFutureDate(foundationDate, options.now)) {
    issues.push("Data de fundação não pode ser futura.");
  }
  if (!isValidCnae(readString(company.primaryCnae))) issues.push("CNAE principal inválido.");
  if (secondaryCnaesInput.some((value) => !isValidCnae(String(value)))) {
    issues.push("CNAE secundário inválido.");
  }
  if (new Set(secondaryCnaes).size !== secondaryCnaes.length) {
    issues.push("CNAEs secundários não podem conter duplicidade.");
  }
  if (!isValidEmail(normalizedCompany.institutionalEmail)) issues.push("E-mail institucional inválido.");
  if (normalizedCompany.phone && !isValidBrazilianPhone(normalizedCompany.phone)) {
    issues.push("Telefone inválido.");
  }
  if (!isValidBrazilianPhone(normalizedCompany.whatsapp)) issues.push("WhatsApp inválido.");
  for (const [field, value] of [
    ["Site", normalizedCompany.site],
    ["Instagram", normalizedCompany.instagram],
    ["Facebook", normalizedCompany.facebook],
    ["LinkedIn", normalizedCompany.linkedin],
  ] as const) {
    if (value && !isValidUrl(value)) issues.push(`${field} inválido.`);
  }

  const subscriptionPlanId = normalizeText(readString(input.subscriptionPlanId));
  if (!subscriptionPlanId) issues.push("Plano obrigatório.");

  let address: ParsedOrganizationRegistrationInput["address"] | null = null;
  try {
    address = createAddress({
      cep: readString(input.address.cep),
      city: readString(input.address.city),
      complement: optionalString(input.address.complement),
      logradouro: readString(input.address.logradouro),
      neighborhood: readString(input.address.neighborhood),
      number: readString(input.address.number),
      state: readString(input.address.state),
    });
  } catch (error) {
    if (error instanceof ValidationException) {
      issues.push(...(Array.isArray(error.details) ? error.details.map(String) : [error.message]));
    } else {
      throw error;
    }
  }

  if (issues.length > 0 || !address || !foundationDate) {
    throw new ValidationException("Dados da organização inválidos.", issues);
  }

  return {
    address,
    company: {
      ...normalizedCompany,
      foundationDate,
    },
    subscriptionPlanId,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? normalizeText(value) : undefined;
}

function optionalPhone(value: unknown) {
  const normalized = normalizePhone(readString(value));
  return normalized || undefined;
}

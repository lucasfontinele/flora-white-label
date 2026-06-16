import { ValidationException } from "../../exception/index.js";
import { createAddress, type AddressInput } from "../addresses/address.js";
import {
  isFutureDate,
  isValidBrazilianPhone,
  isValidCnpj,
  isValidEmail,
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
    foundationDate: string;
    institutionalEmail: string;
    legalName: string;
    primaryCnae: string;
    secondaryCnaes?: string[];
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
  const secondaryCnaes = Array.isArray(company.secondaryCnaes)
    ? company.secondaryCnaes.map((value) => normalizeText(String(value))).filter(Boolean)
    : [];

  const normalizedCompany = {
    cnpj: normalizeCnpj(readString(company.cnpj)),
    foundationDate,
    institutionalEmail: normalizeText(readString(company.institutionalEmail)),
    legalName: normalizeText(readString(company.legalName)),
    primaryCnae: normalizeText(readString(company.primaryCnae)),
    secondaryCnaes,
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
  if (!normalizedCompany.primaryCnae) issues.push("CNAE principal obrigatório.");
  if (!isValidEmail(normalizedCompany.institutionalEmail)) issues.push("E-mail institucional inválido.");
  if (!isValidBrazilianPhone(normalizedCompany.whatsapp)) issues.push("WhatsApp inválido.");

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
  return typeof value === "string" && value.trim() ? value : undefined;
}

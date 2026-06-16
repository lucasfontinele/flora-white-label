import { ValidationException } from "../../exception/index.js";
import { isValidBrazilianState, isValidCep, normalizeCep, normalizeText } from "../shared/validation.js";

export type AddressInput = {
  cep: string;
  city: string;
  complement?: string;
  logradouro: string;
  neighborhood: string;
  number: string;
  state: string;
};

export type Address = {
  cep: string;
  city: string;
  complement?: string;
  logradouro: string;
  neighborhood: string;
  number: string;
  state: string;
};

export function createAddress(input: AddressInput): Address {
  const address = {
    cep: normalizeCep(input.cep),
    city: normalizeText(input.city),
    complement: input.complement ? normalizeText(input.complement) : undefined,
    logradouro: normalizeText(input.logradouro),
    neighborhood: normalizeText(input.neighborhood),
    number: normalizeText(input.number),
    state: normalizeText(input.state).toUpperCase(),
  };

  const issues: string[] = [];

  if (!isValidCep(address.cep)) issues.push("CEP inválido.");
  if (!address.logradouro) issues.push("Logradouro obrigatório.");
  if (!address.number) issues.push("Número obrigatório.");
  if (!address.neighborhood) issues.push("Bairro obrigatório.");
  if (!address.city) issues.push("Cidade obrigatória.");
  if (!isValidBrazilianState(address.state)) issues.push("Estado inválido.");

  if (issues.length > 0) {
    throw new ValidationException("Endereço inválido.", issues);
  }

  return address;
}

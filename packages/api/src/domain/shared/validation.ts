export const brazilianStates = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export type BrazilianState = (typeof brazilianStates)[number];

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeText(value: string) {
  return value.trim();
}

export function normalizeCnpj(value: string) {
  return onlyDigits(value);
}

export function isValidCnpj(value: string) {
  const cnpj = normalizeCnpj(value);

  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const digits = cnpj.split("").map(Number);
  const calculateDigit = (length: number) => {
    const weights =
      length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = digits.slice(0, length).reduce((acc, digit, index) => acc + digit * weights[index]!, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return calculateDigit(12) === digits[12] && calculateDigit(13) === digits[13];
}

export function normalizeCep(value: string) {
  return onlyDigits(value);
}

export function isValidCep(value: string) {
  return normalizeCep(value).length === 8;
}

export function normalizePhone(value: string) {
  return onlyDigits(value);
}

export function isValidBrazilianPhone(value: string) {
  const length = normalizePhone(value).length;
  return length === 10 || length === 11;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidBrazilianState(value: string): value is BrazilianState {
  return brazilianStates.includes(value.trim().toUpperCase() as BrazilianState);
}

export function parseDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isFutureDate(date: Date, now = new Date()) {
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const valueUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return valueUtc > todayUtc;
}

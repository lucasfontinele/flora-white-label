export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length !== 11) return value;

  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatBrazilianPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

export function formatUf(value: string) {
  return value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
}

export function normalizeCnae(value: string) {
  return onlyDigits(value).slice(0, 7);
}

export function formatCnae(value: string) {
  const digits = normalizeCnae(value);

  return digits
    .replace(/^(\d{4})(\d)/, "$1-$2")
    .replace(/^(\d{4})-(\d)(\d)/, "$1-$2/$3");
}

export function isValidCnae(value: string) {
  return onlyDigits(value).length === 7 && /^[\d./-]+$/.test(value.trim());
}

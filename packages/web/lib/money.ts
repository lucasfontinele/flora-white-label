export function formatCentsAsCurrency(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(valueInCents / 100);
}

export function parseCurrencyToCents(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function assertIntegerCents(value: number) {
  return Number.isInteger(value) && value >= 0;
}

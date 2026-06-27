// The 26 Brazilian states plus the Federal District (UF codes). Single source of
// truth shared by the registration form and the prescriber management screen.
export const BRAZILIAN_UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export type BrazilianUf = (typeof BRAZILIAN_UFS)[number];

export function isValidUf(value: string): boolean {
  return BRAZILIAN_UFS.includes(value.trim().toUpperCase() as BrazilianUf);
}

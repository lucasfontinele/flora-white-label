/**
 * The 26 Brazilian states plus the Federal District (UF codes).
 */
const BRAZILIAN_STATES = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

export function isValidBrazilianState(uf: string): boolean {
  return BRAZILIAN_STATES.has(uf);
}

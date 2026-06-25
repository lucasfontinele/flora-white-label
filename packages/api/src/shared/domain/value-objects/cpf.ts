/**
 * Pure CPF helpers (Brazilian taxpayer document). Framework-agnostic.
 */

/** Strips any non-digit character (mask removal). */
export function stripDocumentMask(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Validates a CPF using the official check-digit algorithm. Expects a
 * digits-only string of length 11. Sequences with all equal digits
 * (e.g. "00000000000") are rejected even though they satisfy the arithmetic.
 */
export function isValidCpf(digits: string): boolean {
  if (!/^\d{11}$/.test(digits)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const checkDigit = (length: number): number => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return checkDigit(9) === Number(digits[9]) && checkDigit(10) === Number(digits[10]);
}

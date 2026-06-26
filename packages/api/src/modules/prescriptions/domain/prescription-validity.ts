/**
 * Regulatory validity window for a cannabis prescription (ANVISA): a receita is
 * valid for 6 months from its emission date. The validUntil column is always
 * derived from issuedAt with this constant — never set by hand.
 */
export const PRESCRIPTION_VALIDITY_MONTHS = 6;

/**
 * Adds whole months to a date in UTC, clamping the day to the last day of the
 * target month (e.g. Aug 31 + 6 months → Feb 28/29, not Mar 3). Works in UTC
 * because prescription dates are stored/compared as UTC midnight.
 */
export function addMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const target = new Date(
    Date.UTC(
      year,
      month + months,
      1,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );

  const lastDayOfTargetMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();

  target.setUTCDate(Math.min(day, lastDayOfTargetMonth));

  return target;
}

/**
 * Computes the validUntil date for a receita emitted on `issuedAt`.
 */
export function computePrescriptionValidUntil(issuedAt: Date): Date {
  return addMonths(issuedAt, PRESCRIPTION_VALIDITY_MONTHS);
}

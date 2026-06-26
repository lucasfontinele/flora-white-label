import { PrescriptionPeriod } from "./enums/PrescriptionPeriod.js";

export interface PeriodWindow {
  from: Date;
  to: Date;
}

/**
 * Computes the consumption window for a posology period at a given moment.
 * MONTHLY renews every calendar month; ANNUAL every calendar year. Both are
 * computed in UTC and returned as a half-open interval `[from, to)`.
 */
export function currentPeriodWindow(
  period: PrescriptionPeriod,
  reference: Date = new Date(),
): PeriodWindow {
  const year = reference.getUTCFullYear();

  if (period === PrescriptionPeriod.Monthly) {
    const month = reference.getUTCMonth();
    return {
      from: new Date(Date.UTC(year, month, 1)),
      to: new Date(Date.UTC(year, month + 1, 1)),
    };
  }

  return {
    from: new Date(Date.UTC(year, 0, 1)),
    to: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

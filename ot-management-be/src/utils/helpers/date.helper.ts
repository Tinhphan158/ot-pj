/**
 * The team's timezone as a fixed offset. Vietnam is UTC+7 year-round (no DST),
 * so plain arithmetic is exact — and it keeps "today" stable no matter which
 * timezone the process runs in (the containers default to UTC).
 */
export const APP_UTC_OFFSET_MINUTES = 7 * 60;

/** Format a Date as YYYY-MM-DD — the shape of the date-only columns. */
export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Midnight of the current day in the team's timezone, built the way `@db.Date`
 * columns store dates (UTC midnight) so it compares directly against them.
 *
 * A row on or after this cutoff is overtime that has not happened yet.
 */
export function startOfToday(): Date {
  const local = new Date(Date.now() + APP_UTC_OFFSET_MINUTES * 60_000);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
}

/**
 * The OT month cycle a date-only value falls in, as [start, end). A cycle runs
 * from the 21st of one month to the 20th of the next — the client's
 * `monthCycle` draws the same boundaries.
 */
export function otMonthRange(date: Date): { start: Date; end: Date } {
  const y = date.getUTCFullYear();
  // Days 21+ roll into next month's cycle; Date.UTC carries month overflow.
  const labelMonth = date.getUTCMonth() + (date.getUTCDate() >= 21 ? 1 : 0);
  return { start: new Date(Date.UTC(y, labelMonth - 1, 21)), end: new Date(Date.UTC(y, labelMonth, 21)) };
}

/**
 * The first day an OT month cycle is closed for changes: `graceDays` after the
 * cycle ends. With 3 grace days the cycle ending 20/11 can still be corrected
 * through 23/11 and is locked from 24/11.
 */
export function otMonthLockDate(date: Date, graceDays: number): Date {
  const { end } = otMonthRange(date);
  return new Date(end.getTime() + graceDays * 24 * 60 * 60_000);
}

export function isOtMonthLocked(date: Date, graceDays: number): boolean {
  return startOfToday() >= otMonthLockDate(date, graceDays);
}

/** The OT year a date-only value falls in: 21/12 of the year before → 20/12, as [start, end). */
export function otYearRange(date: Date): { start: Date; end: Date } {
  const y = date.getUTCFullYear();
  const labelYear = date.getUTCMonth() === 11 && date.getUTCDate() >= 21 ? y + 1 : y;
  return { start: new Date(Date.UTC(labelYear - 1, 11, 21)), end: new Date(Date.UTC(labelYear, 11, 21)) };
}

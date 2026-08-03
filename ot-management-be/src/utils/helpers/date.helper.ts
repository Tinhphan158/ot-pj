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

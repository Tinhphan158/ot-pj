import { VN_HOLIDAYS } from '../constants/holidays.const';
import { toDateString } from './date.helper';

/**
 * Duration in hours between two "HH:mm" time strings.
 * Supports overnight ranges (end earlier than start rolls over midnight).
 */
export function computeOvertimeHours(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes <= 0) minutes += 24 * 60;
  return Math.round((minutes / 60) * 100) / 100;
}

/** Round an hour total to 2 decimals — float sums drift (8.4 + 2.1 = 10.500000000000002). */
export function roundHours(hours: number): number {
  return Math.round(hours * 100) / 100;
}

/** "HH:mm" -> minutes since midnight. */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

/**
 * The most overtime one person may register per OT month cycle (21st → 20th)
 * and per OT year (21/12 of the previous year → 20/12).
 */
export const OVERTIME_MONTHLY_LIMIT_HOURS = 40;
export const OVERTIME_YEARLY_LIMIT_HOURS = 200;

export type OvertimeDayType = 'weekday' | 'weekend' | 'holiday';
export type OvertimeWindow = { start: string; end: string };

/**
 * Hours overtime may be registered in. A working day only has the evening
 * after office hours; a weekend or public holiday is a day off, so most of it
 * is open. The client fetches these through `GET /overtimes/rules` and draws
 * its timelines on exactly these ranges.
 */
export const OVERTIME_WINDOWS: Readonly<{ weekday: OvertimeWindow; dayOff: OvertimeWindow }> = {
  weekday: { start: '17:00', end: '22:00' },
  dayOff: { start: '08:00', end: '22:00' },
};

/** Pay rate per day type, as set by the Labour Code (art. 98): 150% / 200% / 300%. */
export const OVERTIME_MULTIPLIERS: Readonly<Record<OvertimeDayType, number>> = {
  weekday: 1.5,
  weekend: 2,
  holiday: 3,
};

/** A date-only value's day type. A holiday on a weekend counts as the holiday. */
export function overtimeDayType(date: Date): OvertimeDayType {
  if (VN_HOLIDAYS[toDateString(date)]) return 'holiday';
  const dow = date.getUTCDay();
  return dow === 0 || dow === 6 ? 'weekend' : 'weekday';
}

export function overtimeWindowFor(date: Date): OvertimeWindow {
  return overtimeDayType(date) === 'weekday' ? OVERTIME_WINDOWS.weekday : OVERTIME_WINDOWS.dayOff;
}

/**
 * Why the range is not a legal overtime window, or null when it is. Both ends
 * must sit inside the window and the range must move forwards — an overnight
 * range cannot fit, so the rollover the other helpers allow is rejected here.
 */
export function overtimeWindowViolation(startTime: string, endTime: string, window: OvertimeWindow): string | null {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (end <= start) return 'endTime must be later than startTime';
  if (start < toMinutes(window.start) || end > toMinutes(window.end)) {
    return `Overtime on this day must fall between ${window.start} and ${window.end}`;
  }
  return null;
}

/**
 * Whether two time ranges on the same day overlap. Touching boundaries do NOT
 * overlap (17:00–19:00 and 19:00–20:00 are fine). Overnight ranges roll over.
 */
export function overtimeRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const a1 = toMinutes(startA);
  let a2 = toMinutes(endA);
  if (a2 <= a1) a2 += 24 * 60;

  const b1 = toMinutes(startB);
  let b2 = toMinutes(endB);
  if (b2 <= b1) b2 += 24 * 60;

  return a1 < b2 && b1 < a2;
}

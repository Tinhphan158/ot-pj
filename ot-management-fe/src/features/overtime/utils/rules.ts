import type { OvertimeDayType, OvertimeRules, OvertimeWindow } from '@/shared/api';
import { monthCycle, parseDateStr } from '@/features/overtime/utils/period';

/**
 * Used until the rules have loaded — the weekday evening, the strictest
 * window, so nothing is offered that the server would turn down.
 */
export const FALLBACK_WINDOW: OvertimeWindow = { start: '17:00', end: '22:00' };

export const DAY_TYPE_LABEL: Record<OvertimeDayType, string> = {
  weekday: 'Weekday',
  weekend: 'Weekend',
  holiday: 'Public holiday',
};

const holidayMaps = new WeakMap<OvertimeRules, Map<string, string>>();

/** The holiday's name when `date` (YYYY-MM-DD) is a public holiday. */
export function holidayName(date: string, rules: OvertimeRules | undefined): string | undefined {
  if (!rules) return undefined;
  let map = holidayMaps.get(rules);
  if (!map) {
    map = new Map(rules.holidays.map((holiday) => [holiday.date, holiday.name]));
    holidayMaps.set(rules, map);
  }
  return map.get(date);
}

/** Same precedence as the server: a holiday on a weekend counts as the holiday. */
export function dayTypeOf(date: string, rules: OvertimeRules | undefined): OvertimeDayType {
  if (holidayName(date, rules)) return 'holiday';
  const dow = parseDateStr(date).getDay();
  return dow === 0 || dow === 6 ? 'weekend' : 'weekday';
}

export function windowFor(date: string, rules: OvertimeRules | undefined): OvertimeWindow {
  if (!rules) return FALLBACK_WINDOW;
  return dayTypeOf(date, rules) === 'weekday' ? rules.windows.weekday : rules.windows.dayOff;
}

/**
 * The first day the OT month holding `date` is closed: `lockGraceDays` after
 * the cycle's last day (the 20th). Mirrors the server's `otMonthLockDate`.
 */
export function lockDateOf(date: string, rules: OvertimeRules): Date {
  const { endExclusive } = monthCycle(parseDateStr(date));
  return new Date(endExclusive.getFullYear(), endExclusive.getMonth(), endExclusive.getDate() + rules.lockGraceDays);
}

/** Whether the OT month holding `date` no longer accepts changes. Unknown until the rules load. */
export function isDateLocked(date: string, rules: OvertimeRules | undefined): boolean {
  if (!rules || !date) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return today >= lockDateOf(date, rules);
}

import type { OvertimeWindow } from '@/shared/api';
import { timeToMinutes } from '@/features/overtime/utils/period';
import { FALLBACK_WINDOW } from '@/features/overtime/utils/rules';

export interface TimeDomain {
  /** First minute on the axis. */
  start: number;
  /** Last minute on the axis. */
  end: number;
  /** Minutes the axis spans; the divisor for turning minutes into a percent. */
  span: number;
  /** Whole-hour marks inside the domain, for gridlines and labels. */
  hourTicks: number[];
}

function buildHourTicks(start: number, end: number): number[] {
  const ticks: number[] = [];
  for (let m = Math.ceil(start / 60) * 60; m <= end; m += 60) ticks.push(m);
  return ticks;
}

/**
 * The hour axis for a day is exactly the window overtime may be registered in
 * on it: a timeline never draws an hour outside it and a drag cannot leave it.
 * Fixed per window rather than derived from the entries on screen, so the same
 * evening occupies the same pixels on every view and from one day to the next.
 */
export function buildTimeDomain(window: OvertimeWindow): TimeDomain {
  const start = timeToMinutes(window.start);
  const end = timeToMinutes(window.end);
  return { start, end, span: end - start, hourTicks: buildHourTicks(start, end) };
}

export const FALLBACK_DOMAIN = buildTimeDomain(FALLBACK_WINDOW);

export const formatTick = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:00`;

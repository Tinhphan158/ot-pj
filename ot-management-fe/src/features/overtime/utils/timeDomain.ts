/**
 * Overtime is only allowed in the evening window 17:00–22:00, so that window is
 * the whole axis: the timelines never draw an hour outside it and a drag cannot
 * leave it. Keep these in step with the same rule on the server.
 */
export const OT_WINDOW_START_MINUTES = 17 * 60;
export const OT_WINDOW_END_MINUTES = 22 * 60;
export const OT_WINDOW_START_TIME = '17:00';
export const OT_WINDOW_END_TIME = '22:00';

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
 * The hour axis every timeline draws on. Fixed rather than derived from the
 * entries on screen, so the same evening occupies the same pixels on every view
 * and from one day to the next.
 */
export const OVERTIME_DOMAIN: TimeDomain = {
  start: OT_WINDOW_START_MINUTES,
  end: OT_WINDOW_END_MINUTES,
  span: OT_WINDOW_END_MINUTES - OT_WINDOW_START_MINUTES,
  hourTicks: buildHourTicks(OT_WINDOW_START_MINUTES, OT_WINDOW_END_MINUTES),
};

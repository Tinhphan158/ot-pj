import type { Overtime } from '@/shared/api';
import { timeToMinutes } from './period';

/**
 * Empty axis kept past each end of the data. Without it the outermost bar sits
 * flush against the border and there is nowhere to drag its edge into.
 */
const HEADROOM_MINUTES = 60;

const DAY_END_MINUTES = 24 * 60;

/** Axis shown when there is nothing to plot. */
const FALLBACK_START = 17 * 60;
const FALLBACK_END = 22 * 60;

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

/**
 * The hour axis a timeline draws its bars on, derived from the entries it shows.
 *
 * `draft` is the range of a bar currently being dragged. It is folded in so the
 * axis stretches to keep the dragged edge visible — otherwise a drag past the
 * last stored entry pins the bar to the border while its time keeps climbing.
 */
export function buildTimeDomain(
  overtimes: Overtime[],
  draft?: { start: number; end: number } | null,
): TimeDomain {
  const hasData = overtimes.length > 0;
  const dataStart = hasData
    ? Math.min(...overtimes.map((o) => timeToMinutes(o.startTime)))
    : FALLBACK_START;
  const dataEnd = hasData ? Math.max(...overtimes.map((o) => timeToMinutes(o.endTime))) : FALLBACK_END;

  // Round the data outwards to whole hours first, so headroom lands on an hour too.
  let start = Math.floor(dataStart / 60) * 60 - HEADROOM_MINUTES;
  let end = Math.ceil(dataEnd / 60) * 60 + HEADROOM_MINUTES;

  // A drag stretches the axis exactly as far as it needs, with no headroom of its
  // own: the dragged edge then rides the border instead of the axis jumping an
  // hour ahead of the pointer.
  if (draft) {
    start = Math.min(start, draft.start);
    end = Math.max(end, draft.end);
  }

  start = Math.max(start, 0);
  end = Math.min(Math.max(end, start + 60), DAY_END_MINUTES);

  const hourTicks: number[] = [];
  for (let m = Math.ceil(start / 60) * 60; m <= end; m += 60) hourTicks.push(m);

  return { start, end, span: end - start, hourTicks };
}

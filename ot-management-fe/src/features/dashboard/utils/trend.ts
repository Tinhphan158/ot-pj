import type { DashboardDailyPoint } from '@/shared/api';
import { MONTH_NAMES, formatDate, weekdayName } from '@/shared/utils/format';
import {
  addDays,
  monthCycle,
  parseDateStr,
  startOfWeek,
  toDateStr,
  type OvertimeView,
} from '@/features/overtime/utils/period';

/** The dashboard aggregates over whole periods, so the Day view doesn't apply. */
export type DashboardPeriod = Exclude<OvertimeView, 'day'>;

export const DASHBOARD_PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

/** Human label for the period the anchor falls in, e.g. "July: 21/06 – 20/07". */
export function periodLabel(period: DashboardPeriod, anchor: Date): string {
  switch (period) {
    case 'week': {
      const start = startOfWeek(anchor);
      return `${formatDate(start, 'dd/MM')} – ${formatDate(addDays(start, 6), 'dd/MM/yyyy')}`;
    }
    case 'month': {
      const { start, endExclusive, labelMonth } = monthCycle(anchor);
      return `${MONTH_NAMES[labelMonth]}: ${formatDate(start, 'dd/MM')} – ${formatDate(addDays(endExclusive, -1), 'dd/MM/yyyy')}`;
    }
    case 'year':
      return `Year ${anchor.getFullYear()}`;
  }
}

export interface TrendPoint {
  label: string;
  hours: number;
  entries: number;
  /** Day buckets carry their date so the chart can deep-link into the Day view. */
  date?: string;
  /** Month buckets carry their 0-based OT cycle month. */
  monthIndex?: number;
}

/**
 * Buckets the API's per-day totals into the chart series for the active period:
 * week/month → one bucket per day (empty days included), year → one per OT cycle
 * month (21st→20th), matching how the overtime views group time.
 */
export function buildTrend(
  period: DashboardPeriod,
  anchor: Date,
  daily: DashboardDailyPoint[],
): TrendPoint[] {
  const byDate = new Map(daily.map((point) => [point.date, point]));

  if (period === 'year') {
    const buckets: TrendPoint[] = Array.from({ length: 12 }, (_, monthIndex) => ({
      label: `T${monthIndex + 1}`,
      hours: 0,
      entries: 0,
      monthIndex,
    }));
    for (const point of daily) {
      const bucket = buckets[monthCycle(parseDateStr(point.date)).labelMonth];
      bucket.hours += point.hours;
      bucket.entries += point.entries;
    }
    return buckets.map((bucket) => ({ ...bucket, hours: Math.round(bucket.hours * 100) / 100 }));
  }

  const start = period === 'week' ? startOfWeek(anchor) : monthCycle(anchor).start;
  const end = period === 'week' ? addDays(start, 7) : monthCycle(anchor).endExclusive;

  const points: TrendPoint[] = [];
  for (let day = start; day < end; day = addDays(day, 1)) {
    const date = toDateStr(day);
    const point = byDate.get(date);
    points.push({
      label: period === 'week' ? `${weekdayName(day, true)} ${formatDate(day, 'dd/MM')}` : formatDate(day, 'dd/MM'),
      hours: point?.hours ?? 0,
      entries: point?.entries ?? 0,
      date,
    });
  }
  return points;
}

'use client';

import { Loader2 } from 'lucide-react';
import type { OvertimeUsagePeriod } from '@/shared/api';
import { cn } from '@/shared/utils/cn';
import { formatDate, formatHours } from '@/shared/utils/format';
import { addDays, parseDateStr } from '@/features/overtime/utils/period';
import { useOvertimeUsageQuery } from '@/features/overtime/hooks/queries/useOvertimeUsageQuery';
import { usageLevel, type UsageLevel } from '@/features/overtime/utils/usage';

interface OvertimeUsagePanelProps {
  /** The day being registered; picks which OT month and year to report. */
  date: string;
}

const BAR_CLASS: Record<UsageLevel, string> = {
  ok: 'bg-primary',
  warning: 'bg-amber-500',
  over: 'bg-destructive',
};

const TEXT_CLASS: Record<UsageLevel, string> = {
  ok: 'text-muted-foreground',
  warning: 'text-amber-600 dark:text-amber-400',
  over: 'text-destructive',
};

function UsageRow({ label, period }: { label: string; period: OvertimeUsagePeriod }) {
  const after = period.registered;
  const level = usageLevel(after, period.limit);
  const lastDay = addDays(parseDateStr(period.to), -1);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn('tabular-nums', level !== 'ok' && 'font-semibold', TEXT_CLASS[level])}>
          {formatHours(after)} / {period.limit}h
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-[width]', BAR_CLASS[level])}
          style={{ width: `${Math.min(100, (after / period.limit) * 100)}%` }}
        />
      </div>
      <p className={cn('text-xs', TEXT_CLASS[level])}>
        {level === 'over'
          ? `Over the limit by ${formatHours(after - period.limit)}`
          : `${formatHours(period.limit - after)} left`}
        <span className="text-muted-foreground">
          {' '}
          · {formatDate(parseDateStr(period.from), 'dd/MM')} – {formatDate(lastDay, 'dd/MM/yyyy')}
        </span>
      </p>
    </div>
  );
}

/**
 * The user's standing against the monthly and yearly caps, counting only hours
 * already registered — the entry being filled in is not added.
 */
export function OvertimeUsagePanel({ date }: OvertimeUsagePanelProps) {
  const query = useOvertimeUsageQuery(date || undefined);

  if (!date) return null;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Your overtime limits</p>
        {query.isFetching && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
      </div>
      {query.data ? (
        <>
          <UsageRow label="This OT month" period={query.data.monthly} />
          <UsageRow label="This OT year" period={query.data.yearly} />
        </>
      ) : query.isError ? (
        <p className="text-xs text-muted-foreground">Could not load your remaining hours.</p>
      ) : (
        <div className="h-20" />
      )}
    </div>
  );
}

'use client';

import { AlertTriangle, OctagonAlert } from 'lucide-react';
import type { OvertimeUsagePeriod } from '@/shared/api';
import { cn } from '@/shared/utils/cn';
import { formatHours } from '@/shared/utils/format';
import { toDateStr } from '@/features/overtime/utils/period';
import { usageLevel, USAGE_WARNING_RATIO } from '@/features/overtime/utils/usage';
import { useOvertimeUsageQuery } from '@/features/overtime/hooks/queries/useOvertimeUsageQuery';

function describe(label: string, period: OvertimeUsagePeriod): string {
  const left = period.limit - period.registered;
  return left >= 0
    ? `${formatHours(period.registered)} of your ${period.limit}h ${label} limit registered — ${formatHours(left)} left`
    : `${formatHours(period.registered)} registered, ${formatHours(-left)} over your ${period.limit}h ${label} limit`;
}

/**
 * Warns the signed-in user once they have booked most of this OT month's or
 * year's cap. Counts upcoming days too, since that is what the cap blocks on.
 * Renders nothing while comfortably under both.
 */
export function OvertimeLimitBanner({ className }: { className?: string }) {
  const query = useOvertimeUsageQuery(toDateStr(new Date()));
  if (!query.data) return null;

  const { monthly, yearly } = query.data;
  const periods = [
    { label: 'monthly', period: monthly, level: usageLevel(monthly.registered, monthly.limit) },
    { label: 'yearly', period: yearly, level: usageLevel(yearly.registered, yearly.limit) },
  ].filter((item) => item.level !== 'ok');
  if (periods.length === 0) return null;

  const over = periods.some((item) => item.level === 'over');
  const Icon = over ? OctagonAlert : AlertTriangle;

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        over
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-0.5">
        <p className="font-medium">
          {over ? 'You are over your overtime limit' : `You have used over ${USAGE_WARNING_RATIO * 100}% of your overtime limit`}
        </p>
        {periods.map((item) => (
          <p key={item.label} className="text-xs opacity-90">
            {describe(item.label, item.period)}
          </p>
        ))}
      </div>
    </div>
  );
}

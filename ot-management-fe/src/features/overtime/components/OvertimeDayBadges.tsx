'use client';

import { CalendarHeart, Lock } from 'lucide-react';
import type { OvertimeRules } from '@/shared/api';
import { cn } from '@/shared/utils/cn';
import { DAY_TYPE_LABEL, dayTypeOf, holidayName, isDateLocked } from '@/features/overtime/utils/rules';

/**
 * Small labels for what makes a day special: a holiday or weekend (paid at a
 * higher rate, with a longer window) and a closed OT month.
 */
export function OvertimeDayBadges({ date, rules, className }: { date: string; rules?: OvertimeRules; className?: string }) {
  if (!rules) return null;
  const dayType = dayTypeOf(date, rules);
  const holiday = holidayName(date, rules);
  const locked = isDateLocked(date, rules);
  if (dayType === 'weekday' && !locked) return null;

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1', className)}>
      {dayType !== 'weekday' && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium',
            dayType === 'holiday'
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              : 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
          )}
          title={`Paid at ${rules.multipliers[dayType] * 100}%`}
        >
          {dayType === 'holiday' && <CalendarHeart className="size-3" />}
          {holiday ?? DAY_TYPE_LABEL[dayType]} · ×{rules.multipliers[dayType]}
        </span>
      )}
      {locked && (
        <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          <Lock className="size-3" />
          Month closed
        </span>
      )}
    </span>
  );
}

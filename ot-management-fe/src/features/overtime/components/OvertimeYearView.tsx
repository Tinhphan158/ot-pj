'use client';

import { useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { formatHours } from '@/shared/utils/format';
import type { Overtime } from '@/shared/api';
import { monthCycle, parseDateStr } from '@/features/overtime/utils/period';
import { OvertimeUserAvatar } from '@/features/overtime/components/OvertimeUserAvatar';

interface OvertimeYearViewProps {
  overtimes: Overtime[];
  currentUserId?: string;
  onSelectMonth: (monthIndex: number) => void;
}

interface UserRow {
  id: string;
  name: string;
  avatar: string | null;
  total: number;
  email: string;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function OvertimeYearView({ overtimes, currentUserId, onSelectMonth }: OvertimeYearViewProps) {
  const { rows, cellMap, maxHours } = useMemo(() => {
    const userMap = new Map<string, UserRow>();
    const cells = new Map<string, number>(); // `${userId}|${monthIndex}` -> hours
    let max = 0;

    for (const o of overtimes) {
      if (!userMap.has(o.userId)) {
        userMap.set(o.userId, { id: o.userId, name: o.user?.name ?? '—', email: o.user?.email ?? '—', avatar: o.user?.avatar ?? null, total: 0 });
      }
      const row = userMap.get(o.userId)!;
      row.total += o.hours;

      // Bucket by OT cycle month (21st→20th), not calendar month.
      const monthIndex = monthCycle(parseDateStr(o.date)).labelMonth;
      const key = `${o.userId}|${monthIndex}`;
      const next = (cells.get(key) ?? 0) + o.hours;
      cells.set(key, next);
      if (next > max) max = next;
    }

    // Most overtime first; the "You" row is found by its highlight, not by position.
    const list = [...userMap.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    return { rows: list, cellMap: cells, maxHours: max };
  }, [overtimes]);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
        No overtime in this year.
      </div>
    );
  }

  const cellStyle = (hours: number) => {
    if (hours <= 0) return undefined;
    const intensity = maxHours > 0 ? hours / maxHours : 0;
    const pct = Math.round(12 + intensity * 60);
    return { backgroundColor: `color-mix(in srgb, var(--primary) ${pct}%, transparent)` };
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-40 border-b bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Employee
              </th>
              {MONTH_LABELS.map((label) => (
                <th key={label} className="min-w-14 border-b px-1 py-2 text-center text-[11px] font-medium text-muted-foreground">
                  {label}
                </th>
              ))}
              <th className="border-b bg-card px-3 py-2 text-right text-xs font-medium text-muted-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const mine = row.id === currentUserId;
              return (
                <tr key={row.id} className={cn(mine && 'bg-primary/5')}>
                  <td className={cn('sticky left-0 z-10 border-b px-3 py-1.5', mine ? 'bg-primary/5' : 'bg-card')}>
                    <span className="flex items-center gap-2">
                      <OvertimeUserAvatar userId={row.id} name={row.name} avatarUrl={row.avatar} className="size-6" />
                      <div className='flex flex-col'>
                        <div className='flex items-center gap-2'>
                          <span className="truncate font-medium">{row.name}</span>
                          {mine && (
                            <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                              You
                            </span>
                          )}
                        </div>
                        <span className="truncate text-xs text-muted-foreground">{row.email ?? '—'}</span>
                      </div>
                    </span>
                  </td>
                  {MONTH_LABELS.map((label, monthIndex) => {
                    const hours = cellMap.get(`${row.id}|${monthIndex}`) ?? 0;
                    return (
                      <td key={label} className="border-b p-0.5 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectMonth(monthIndex)}
                          title={hours > 0 ? `${row.name} · ${label} · ${formatHours(hours)}` : label}
                          className="flex h-8 w-full items-center justify-center rounded text-[11px] font-medium tabular-nums transition-colors hover:ring-1 hover:ring-primary"
                          style={cellStyle(hours)}
                        >
                          {hours > 0 ? formatHours(hours) : ''}
                        </button>
                      </td>
                    );
                  })}
                  <td className={cn('border-b px-3 py-1.5 text-right font-semibold', mine ? 'bg-primary/5' : '')}>
                    {formatHours(row.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 60%, transparent)' }} />
          Darker cells mean more hours
        </span>
        <span>Click a cell to see that month&apos;s detail</span>
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { formatHours } from '@/shared/utils/format';
import type { Overtime } from '@/shared/api';
import { addDays, isSameDay, monthCycle, toDateStr } from '@/features/overtime/utils/period';
import { OvertimeUserAvatar } from '@/features/overtime/components/OvertimeUserAvatar';

interface OvertimeMonthViewProps {
  overtimes: Overtime[];
  monthAnchor: Date;
  currentUserId?: string;
  onSelectDay: (date: string) => void;
}

interface UserRow {
  id: string;
  name: string;
  avatar: string | null;
  total: number;
}

/** Compact hours label for a matrix cell, e.g. "2h", "2.5h". */
function cellHours(hours: number): string {
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

export function OvertimeMonthView({ overtimes, monthAnchor, currentUserId, onSelectDay }: OvertimeMonthViewProps) {
  const { labelMonth, labelYear } = monthCycle(monthAnchor);
  // Columns span the OT cycle (21st of prev month → 20th of the label month).
  const days = useMemo(() => {
    const { start, endExclusive } = monthCycle(monthAnchor);
    const arr: Date[] = [];
    for (let d = new Date(start); d < endExclusive; d = addDays(d, 1)) arr.push(d);
    return arr;
  }, [monthAnchor]);

  const { rows, cellMap, maxHours } = useMemo(() => {
    const userMap = new Map<string, UserRow>();
    const cells = new Map<string, number>(); // `${userId}|${day}` -> hours
    let max = 0;

    for (const o of overtimes) {
      if (!userMap.has(o.userId)) {
        userMap.set(o.userId, { id: o.userId, name: o.user?.name ?? '—', avatar: o.user?.avatar ?? null, total: 0 });
      }
      const row = userMap.get(o.userId)!;
      row.total += o.hours;

      const day = Number(o.date.slice(8, 10));
      const key = `${o.userId}|${day}`;
      const next = (cells.get(key) ?? 0) + o.hours;
      cells.set(key, next);
      if (next > max) max = next;
    }

    const list = [...userMap.values()].sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      return a.name.localeCompare(b.name);
    });
    return { rows: list, cellMap: cells, maxHours: max };
  }, [overtimes, currentUserId]);

  const today = new Date();

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
        Không có OT nào trong tháng {labelMonth + 1}/{labelYear}.
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
                Nhân viên
              </th>
              {days.map((day) => {
                const dow = day.getDay();
                const weekend = dow === 0 || dow === 6;
                const isToday = isSameDay(day, today);
                return (
                  <th
                    key={day.getDate()}
                    className={cn(
                      'w-9 border-b px-0 py-2 text-center text-[11px] font-medium',
                      weekend ? 'text-muted-foreground/60' : 'text-muted-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        isToday &&
                          'inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground',
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </th>
                );
              })}
              <th className="border-b bg-card px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                Tổng
              </th>
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
                      <span className="truncate font-medium">{row.name}</span>
                      {mine && (
                        <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                          You
                        </span>
                      )}
                    </span>
                  </td>
                  {days.map((day) => {
                    const dateStr = toDateStr(day);
                    const hours = cellMap.get(`${row.id}|${day.getDate()}`) ?? 0;
                    return (
                      <td key={dateStr} className="border-b p-0.5 text-center">
                        <button
                          type="button"
                          onClick={() => onSelectDay(dateStr)}
                          title={hours > 0 ? `${row.name} · ${dateStr} · ${formatHours(hours)}` : dateStr}
                          className="flex h-7 w-full items-center justify-center rounded text-[10px] font-medium transition-colors hover:ring-1 hover:ring-primary"
                          style={cellStyle(hours)}
                        >
                          {hours > 0 ? cellHours(hours) : ''}
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
          Ô càng đậm càng nhiều giờ
        </span>
        <span>Bấm vào ô để xem chi tiết ngày</span>
      </div>
    </div>
  );
}

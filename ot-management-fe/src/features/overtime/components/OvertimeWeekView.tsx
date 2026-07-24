'use client';

import { useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { formatHours, weekdayVi } from '@/shared/utils/format';
import type { Overtime } from '@/shared/api';
import { userColor } from '@/features/overtime/utils/userColor';
import { OvertimeUserAvatar } from '@/features/overtime/components/OvertimeUserAvatar';
import { addDays, isSameDay, timeToMinutes, toDateStr } from '@/features/overtime/utils/period';

interface OvertimeWeekViewProps {
  overtimes: Overtime[];
  weekStart: Date;
  currentUserId?: string;
  onSelectDay: (date: string) => void;
  onSelect?: (overtime: Overtime) => void;
}

export function OvertimeWeekView({ overtimes, weekStart, currentUserId, onSelectDay, onSelect }: OvertimeWeekViewProps) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const domain = useMemo(() => {
    if (overtimes.length === 0) return { start: 17 * 60, end: 22 * 60 };
    const starts = overtimes.map((o) => timeToMinutes(o.startTime));
    const ends = overtimes.map((o) => timeToMinutes(o.endTime));
    const min = Math.floor(Math.min(...starts) / 60) * 60;
    const max = Math.max(Math.ceil(Math.max(...ends) / 60) * 60, min + 60);
    return { start: min, end: max };
  }, [overtimes]);

  const span = domain.end - domain.start;
  const hourTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let m = domain.start; m <= domain.end; m += 60) ticks.push(m);
    return ticks;
  }, [domain]);

  const percent = (minutes: number) => ((minutes - domain.start) / span) * 100;

  const byDay = useMemo(() => {
    const map = new Map<string, Overtime[]>();
    for (const o of overtimes) {
      const list = map.get(o.date) ?? [];
      list.push(o);
      map.set(o.date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const aMine = a.userId === currentUserId ? 0 : 1;
        const bMine = b.userId === currentUserId ? 0 : 1;
        if (aMine !== bMine) return aMine - bMine;
        return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
      });
    }
    return map;
  }, [overtimes, currentUserId]);

  const today = new Date();

  return (
    <div className="rounded-xl border bg-card p-4">
      {/* Shared hour axis */}
      <div className="flex">
        <div className="w-100 shrink-0" />
        <div className="relative h-5 flex-1">
          {hourTicks.map((tick) => (
            <span
              key={tick}
              className="absolute -translate-x-1/2 text-[11px] text-muted-foreground"
              style={{ left: `${percent(tick)}%` }}
            >
              {String(Math.floor(tick / 60)).padStart(2, '0')}:00
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col">
        {days.map((day) => {
          const dateStr = toDateStr(day);
          const records = byDay.get(dateStr) ?? [];
          const isToday = isSameDay(day, today);
          return (
            <div key={dateStr} className="border-t py-2 first:border-t-0">
              <button
                type="button"
                onClick={() => onSelectDay(dateStr)}
                className="mb-1.5 flex items-center gap-2 rounded px-1 text-sm hover:text-primary"
              >
                <span className={cn('font-semibold', isToday && 'text-primary')}>{weekdayVi(day)}</span>
                <span className="text-muted-foreground">
                  {String(day.getDate()).padStart(2, '0')}/{String(day.getMonth() + 1).padStart(2, '0')}
                </span>
                {records.length > 0 && (
                  <span className="text-xs text-muted-foreground">· {records.length} người</span>
                )}
              </button>

              {records.length === 0 ? (
                <p className="pl-100 text-xs text-muted-foreground">Không có OT</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {records.map((row) => {
                    const isMine = row.userId === currentUserId;
                    const left = percent(timeToMinutes(row.startTime));
                    const width = Math.max(percent(timeToMinutes(row.endTime)) - left, 2);
                    const color = userColor(row.userId);
                    return (
                      <div key={row.id} className="flex items-center">
                        <div className="flex w-100 shrink-0 items-center gap-2 pr-3">
                          <OvertimeUserAvatar userId={row.userId} name={row.user?.name ?? '—'} avatarUrl={row.user?.avatar} className="size-6" />
                          <span className="flex min-w-0 items-center gap-1.5 truncate text-sm">
                            <span className="truncate font-medium">{row.user?.name ?? '—'}</span>
                            {isMine && (
                              <span className="rounded bg-foreground px-1 py-0.5 text-[10px] font-semibold text-background">
                                You
                              </span>
                            )}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">{row.user?.email ?? '—'}</span>
                        </div>

                        <div className="relative h-8 flex-1 rounded-md bg-muted/40">
                          {hourTicks.map((tick) => (
                            <span
                              key={tick}
                              className="absolute top-0 h-full w-px bg-border/70"
                              style={{ left: `${percent(tick)}%` }}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => onSelect?.(row)}
                            className={cn(
                              'absolute top-1/2 flex h-6 -translate-y-1/2 items-center justify-between gap-2 overflow-hidden rounded px-2 text-xs text-white shadow-sm transition-[filter] hover:brightness-110',
                              onSelect && 'cursor-pointer',
                              isMine && 'ring-2 ring-foreground ring-offset-1 ring-offset-card',
                            )}
                            style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }}
                            title={`${row.user?.name ?? ''} · ${row.startTime}–${row.endTime}`}
                          >
                            <span className="truncate font-medium">
                              {row.startTime}–{row.endTime}
                            </span>
                            <span className="shrink-0 opacity-90">{formatHours(row.hours)}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full ring-2 ring-foreground" /> = You
        </span>
        <span>Mỗi màu là một người · bấm ngày để xem chi tiết · bấm thanh OT để sửa</span>
      </div>
    </div>
  );
}

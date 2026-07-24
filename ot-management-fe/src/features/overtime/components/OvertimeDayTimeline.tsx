'use client';

import { useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { formatHours } from '@/shared/utils/format';
import type { Overtime } from '@/shared/api';
import { userColor } from '@/features/overtime/utils/userColor';

interface OvertimeDayTimelineProps {
  overtimes: Overtime[];
  currentUserId?: string;
  onSelect?: (overtime: Overtime) => void;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function OvertimeDayTimeline({ overtimes, currentUserId, onSelect }: OvertimeDayTimelineProps) {
  const rows = useMemo(() => {
    return [...overtimes].sort((a, b) => {
      const aMine = a.userId === currentUserId ? 0 : 1;
      const bMine = b.userId === currentUserId ? 0 : 1;
      if (aMine !== bMine) return aMine - bMine;
      return toMinutes(a.startTime) - toMinutes(b.startTime);
    });
  }, [overtimes, currentUserId]);

  const domain = useMemo(() => {
    if (rows.length === 0) return { start: 17 * 60, end: 22 * 60 };
    const starts = rows.map((r) => toMinutes(r.startTime));
    const ends = rows.map((r) => toMinutes(r.endTime));
    const min = Math.floor(Math.min(...starts) / 60) * 60;
    const max = Math.max(Math.ceil(Math.max(...ends) / 60) * 60, min + 60);
    return { start: min, end: max };
  }, [rows]);

  const span = domain.end - domain.start;
  const hourTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let m = domain.start; m <= domain.end; m += 60) ticks.push(m);
    return ticks;
  }, [domain]);

  const percent = (minutes: number) => ((minutes - domain.start) / span) * 100;
  const formatTick = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:00`;

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
        No one registered overtime on this day.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex">
        <div className="w-44 shrink-0" />
        <div className="relative h-5 flex-1">
          {hourTicks.map((tick) => (
            <span
              key={tick}
              className="absolute -translate-x-1/2 text-[11px] text-muted-foreground"
              style={{ left: `${percent(tick)}%` }}
            >
              {formatTick(tick)}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {rows.map((row) => {
          const isMine = row.userId === currentUserId;
          const left = percent(toMinutes(row.startTime));
          const width = Math.max(percent(toMinutes(row.endTime)) - left, 2);
          const color = userColor(row.userId);
          return (
            <div key={row.id} className="flex items-center">
              <div className="flex w-44 shrink-0 items-center gap-2 pr-3">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <div className="min-w-0">
                  <span className="flex items-center gap-1.5 truncate text-sm font-medium">
                    <span className="truncate">{row.user?.name ?? '—'}</span>
                    {isMine && (
                      <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                        You
                      </span>
                    )}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{row.user?.email ?? '—'}</span>
                </div>
              </div>

              <div className="relative h-9 flex-1 rounded-md bg-muted/40">
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
                    'absolute top-1/2 flex h-7 -translate-y-1/2 items-center justify-between gap-2 overflow-hidden rounded-md px-2 text-xs text-white shadow-sm transition-[filter] hover:brightness-110',
                    onSelect && 'cursor-pointer',
                    isMine && 'ring-2 ring-foreground ring-offset-1 ring-offset-card',
                  )}
                  style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }}
                  title={`${row.user?.name ?? ''} · ${row.startTime}–${row.endTime} · ${row.reason}`}
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

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full ring-2 ring-foreground" /> = You
        </span>
        <span>Mỗi màu là một người · bấm vào thanh OT để sửa</span>
      </div>
    </div>
  );
}

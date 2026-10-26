'use client';

import { useMemo } from 'react';
import { cn } from '@/shared/utils/cn';
import { weekdayName } from '@/shared/utils/format';
import type { Overtime } from '@/shared/api';
import { userColor } from '@/features/overtime/utils/userColor';
import { OvertimeBar, type OvertimeBarProps } from '@/features/overtime/components/OvertimeBar';
import { OvertimeUserAvatar } from '@/features/overtime/components/OvertimeUserAvatar';
import { addDays, isSameDay, timeToMinutes, toDateStr } from '@/features/overtime/utils/period';
import { buildTimeDomain, formatTick, type TimeDomain } from '@/features/overtime/utils/timeDomain';
import { FALLBACK_WINDOW, isDateLocked, windowFor } from '@/features/overtime/utils/rules';
import { useOvertimeRulesQuery } from '@/features/overtime/hooks/queries/useOvertimeRulesQuery';
import { OvertimeDayBadges } from '@/features/overtime/components/OvertimeDayBadges';

const percentOf = (domain: TimeDomain, minutes: number) => ((minutes - domain.start) / domain.span) * 100;

/** Hour labels across a track of the given domain. */
function HourAxis({ domain }: { domain: TimeDomain }) {
  return (
    <div className="relative h-5 flex-1">
      {domain.hourTicks.map((tick) => (
        <span
          key={tick}
          className="absolute -translate-x-1/2 text-[11px] text-muted-foreground"
          style={{ left: `${percentOf(domain, tick)}%` }}
        >
          {formatTick(tick)}
        </span>
      ))}
    </div>
  );
}

interface OvertimeWeekViewProps {
  overtimes: Overtime[];
  weekStart: Date;
  currentUserId?: string;
  onSelectDay: (date: string) => void;
  onSelect?: (overtime: Overtime) => void;
  onResize?: OvertimeBarProps['onResize'];
}

export function OvertimeWeekView({
  overtimes,
  weekStart,
  currentUserId,
  onSelectDay,
  onSelect,
  onResize,
}: OvertimeWeekViewProps) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const { data: rules } = useOvertimeRulesQuery();
  // The header axis is the weekday evening. Days off have a longer window and
  // carry their own axis under the day's heading, so a weekday bar never shrinks
  // to fit a Saturday.
  const weekdayDomain = useMemo(() => buildTimeDomain(rules?.windows.weekday ?? FALLBACK_WINDOW), [rules]);

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
        <div className="w-80 shrink-0" />
        <HourAxis domain={weekdayDomain} />
      </div>

      <div className="flex flex-col">
        {days.map((day) => {
          const dateStr = toDateStr(day);
          const records = byDay.get(dateStr) ?? [];
          const isToday = isSameDay(day, today);
          const allowed = windowFor(dateStr, rules);
          const domain = allowed === (rules?.windows.weekday ?? FALLBACK_WINDOW) ? weekdayDomain : buildTimeDomain(allowed);
          const ownAxis = domain !== weekdayDomain;
          const locked = isDateLocked(dateStr, rules);
          return (
            <div key={dateStr} className="border-t py-2 first:border-t-0">
              <button
                type="button"
                onClick={() => onSelectDay(dateStr)}
                className="mb-1.5 flex items-center gap-2 rounded px-1 text-sm hover:text-primary"
              >
                <span className={cn('font-semibold', isToday && 'text-primary')}>{weekdayName(day)}</span>
                <span className="text-muted-foreground">
                  {String(day.getDate()).padStart(2, '0')}/{String(day.getMonth() + 1).padStart(2, '0')}
                </span>
                {records.length > 0 && (
                  <span className="text-xs text-muted-foreground">· {records.length} people</span>
                )}
                <OvertimeDayBadges date={dateStr} rules={rules} />
              </button>

              {ownAxis && records.length > 0 && (
                <div className="flex">
                  <div className="w-80 shrink-0" />
                  <HourAxis domain={domain} />
                </div>
              )}

              {records.length === 0 ? (
                <p className="pl-80 text-xs text-muted-foreground">No overtime</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {records.map((row) => {
                    const isMine = row.userId === currentUserId;
                    const color = userColor(row.userId);
                    return (
                      <div key={row.id} className="flex items-center">
                        <div className="flex w-80 shrink-0 items-center gap-2 pr-3">
                          <OvertimeUserAvatar userId={row.userId} name={row.user?.name ?? '—'} avatarUrl={row.user?.avatar} className="size-6" />
                          <div className="flex flex-col">
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
                        </div>

                        <div className="relative h-8 flex-1 rounded-md bg-muted/40">
                          {domain.hourTicks.map((tick) => (
                            <span
                              key={tick}
                              className="absolute top-0 h-full w-px bg-border/70"
                              style={{ left: `${percentOf(domain, tick)}%` }}
                            />
                          ))}
                          <OvertimeBar
                            overtime={row}
                            color={color}
                            isMine={isMine}
                            domainStart={domain.start}
                            domainSpan={domain.span}
                            locked={locked}
                            size="sm"
                            onSelect={onSelect}
                            onResize={onResize}
                          />
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
        <span>
          Each colour is a person · click a day for detail · click a bar to edit · drag either end of
          your own bar to adjust it in 5-minute steps · weekday overtime runs {formatTick(weekdayDomain.start)}–{formatTick(weekdayDomain.end)}; weekends and holidays show their own, longer axis
        </span>
      </div>
    </div>
  );
}

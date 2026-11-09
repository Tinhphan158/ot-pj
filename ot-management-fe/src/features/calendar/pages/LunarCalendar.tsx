'use client';

import { useMemo, useState } from 'react';
import { CalendarHeart, ChevronLeft, ChevronRight, Moon, Sparkles, Sun } from 'lucide-react';
import { AppPageContainer, AppPageHeader } from '@/shared/components/custome';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { MONTH_NAMES, weekdayName } from '@/shared/utils/format';
import {
  auspiciousHours,
  dayCanChi,
  eventsFor,
  formatLunarDate,
  lunarOf,
  monthCanChi,
  shortLunarLabel,
  solarTerm,
  yearAnimal,
  yearCanChi,
  type CalendarEvent,
  type LunarDate,
} from '@/shared/utils/lunar';
import { addDays, isSameDay, toDateStr } from '@/features/overtime/utils/period';
import { holidayName } from '@/features/overtime/utils/rules';
import { useOvertimeRulesQuery } from '@/features/overtime/hooks/queries/useOvertimeRulesQuery';

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DayCell {
  date: Date;
  lunar: LunarDate;
  events: CalendarEvent[];
  /** Official day off, from the server's overtime rules. */
  holiday?: string;
  inMonth: boolean;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export default function LunarCalendar() {
  const today = useMemo(() => new Date(), []);
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(today));
  const [selected, setSelected] = useState(today);
  const { data: rules } = useOvertimeRulesQuery();

  // Six Monday-first weeks, so every month fits without the grid changing height.
  const cells = useMemo<DayCell[]>(() => {
    const offset = (monthAnchor.getDay() + 6) % 7;
    const first = addDays(monthAnchor, -offset);
    return Array.from({ length: 42 }, (_, i) => {
      const date = addDays(first, i);
      const lunar = lunarOf(date);
      return {
        date,
        lunar,
        events: eventsFor(date, lunar),
        holiday: holidayName(toDateStr(date), rules),
        inMonth: date.getMonth() === monthAnchor.getMonth(),
      };
    });
  }, [monthAnchor, rules]);

  const monthCells = useMemo(() => cells.filter((cell) => cell.inMonth), [cells]);
  const lunarSpan = useMemo(() => {
    const first = monthCells[0].lunar;
    const last = monthCells[monthCells.length - 1].lunar;
    const months = first.month === last.month ? `${first.month}` : `${first.month} – ${last.month}`;
    const years = first.year === last.year ? yearCanChi(first.year) : `${yearCanChi(first.year)} / ${yearCanChi(last.year)}`;
    return `Âm lịch tháng ${months} · năm ${years}`;
  }, [monthCells]);

  const shiftMonth = (delta: number) =>
    setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));

  const goToday = () => {
    setMonthAnchor(startOfMonth(today));
    setSelected(today);
  };

  const selectDay = (date: Date) => {
    setSelected(date);
    if (date.getMonth() !== monthAnchor.getMonth() || date.getFullYear() !== monthAnchor.getFullYear()) {
      setMonthAnchor(startOfMonth(date));
    }
  };

  const selectedLunar = useMemo(() => lunarOf(selected), [selected]);
  const selectedEvents = useMemo(() => eventsFor(selected, selectedLunar), [selected, selectedLunar]);
  const selectedHoliday = holidayName(toDateStr(selected), rules);
  const term = solarTerm(selectedLunar.jd);
  const yearOptions = Array.from({ length: 41 }, (_, i) => today.getFullYear() - 20 + i);

  const upcoming = monthCells.filter((cell) => cell.events.length > 0 || cell.holiday);

  return (
    <AppPageContainer className="max-w-7xl">
      <AppPageHeader
        title="Lunar calendar"
        description="Solar and lunar dates side by side, with Vietnamese festivals and public holidays."
        actions={
          <div className="flex items-center gap-3 rounded-2xl border bg-card/80 py-1.5 pr-4 pl-1.5 shadow-sm backdrop-blur">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/memes/payday-cat.gif" alt="Mèo nhảy múa" className="size-14 rounded-xl object-cover" />
            <p className="text-sm font-medium leading-snug">
              Xem lịch lên plan
              <br />
              nghỉ lễ đi chơi đê! 🏖️
            </p>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="gap-0 py-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                <ChevronLeft />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => shiftMonth(1)} aria-label="Next month">
                <ChevronRight />
              </Button>
              <div className="ml-2">
                <p className="text-lg font-semibold leading-tight">
                  {MONTH_NAMES[monthAnchor.getMonth()]} {monthAnchor.getFullYear()}
                </p>
                <p className="text-xs text-muted-foreground">{lunarSpan}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                aria-label="Month"
                value={monthAnchor.getMonth()}
                onChange={(e) => setMonthAnchor(new Date(monthAnchor.getFullYear(), Number(e.target.value), 1))}
                className="h-8 rounded-md border bg-background px-2 text-sm dark:bg-input/30"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Year"
                value={monthAnchor.getFullYear()}
                onChange={(e) => setMonthAnchor(new Date(Number(e.target.value), monthAnchor.getMonth(), 1))}
                className="h-8 rounded-md border bg-background px-2 text-sm dark:bg-input/30"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={goToday}>
                Today
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
            {WEEKDAY_HEADERS.map((day) => (
              <div key={day} className={cn('py-2', day === 'Sun' && 'text-rose-500')}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((cell) => {
              const isToday = isSameDay(cell.date, today);
              const isSelected = isSameDay(cell.date, selected);
              const isSunday = cell.date.getDay() === 0;
              const red = isSunday || cell.holiday;
              const special = cell.lunar.day === 1 || cell.lunar.day === 15;
              const headline = cell.events.find((e) => e.major) ?? cell.events[0];
              return (
                <button
                  key={toDateStr(cell.date)}
                  type="button"
                  onClick={() => selectDay(cell.date)}
                  title={[cell.holiday, ...cell.events.map((e) => e.name)].filter(Boolean).join(' · ') || undefined}
                  className={cn(
                    'relative flex min-h-16 flex-col items-stretch gap-0.5 border-b border-r p-1.5 text-left transition-colors sm:min-h-24 sm:p-2',
                    'nth-[7n]:border-r-0 nth-last-[-n+7]:border-b-0',
                    'hover:bg-accent/50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    !cell.inMonth && 'opacity-40',
                    cell.holiday && 'bg-rose-500/10',
                    isSelected && 'bg-primary/10 ring-2 ring-inset ring-primary',
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={cn(
                        'flex size-6 items-center justify-center rounded-full text-sm font-semibold sm:size-7 sm:text-base',
                        red && 'text-rose-500',
                        isToday && 'bg-primary text-primary-foreground',
                      )}
                    >
                      {cell.date.getDate()}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] tabular-nums sm:text-xs',
                        special ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
                      )}
                    >
                      {shortLunarLabel(cell.lunar)}
                    </span>
                  </div>
                  {(headline || cell.holiday) && (
                    <>
                      <span
                        className={cn(
                          'hidden truncate rounded px-1 py-0.5 text-[10px] leading-tight sm:block',
                          cell.holiday || headline?.major
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {headline?.name ?? cell.holiday}
                      </span>
                      <span className="mx-auto mt-auto size-1.5 rounded-full bg-rose-500 sm:hidden" />
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-rose-500/30" />
              Public holiday (day off)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-semibold text-amber-600 dark:text-amber-400">1/8</span>
              Lunar 1st &amp; 15th (mùng 1, rằm)
            </span>
            <span>Small numbers are lunar days · &quot;N&quot; marks a leap month</span>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="gap-4 overflow-hidden pt-0">
            <div className="bg-primary/10 px-6 py-5 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {weekdayName(selected)} · {MONTH_NAMES[selected.getMonth()]} {selected.getFullYear()}
              </p>
              <p
                className={cn(
                  'text-6xl font-bold tabular-nums',
                  (selected.getDay() === 0 || selectedHoliday) && 'text-rose-500',
                )}
              >
                {selected.getDate()}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
                <Moon className="size-4" />
                {formatLunarDate(selectedLunar)}
              </p>
            </div>
            <CardContent className="space-y-4 text-sm">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                <dt className="text-muted-foreground">Ngày</dt>
                <dd className="font-medium">{dayCanChi(selectedLunar.jd)}</dd>
                <dt className="text-muted-foreground">Tháng</dt>
                <dd className="font-medium">{monthCanChi(selectedLunar)}</dd>
                <dt className="text-muted-foreground">Năm</dt>
                <dd className="font-medium">
                  {yearCanChi(selectedLunar.year)} <span className="text-muted-foreground">({yearAnimal(selectedLunar.year)})</span>
                </dd>
                <dt className="text-muted-foreground">Tiết khí</dt>
                <dd className="flex items-center gap-1.5 font-medium">
                  <Sun className="size-3.5 text-amber-500" />
                  {term.name}
                  {term.startsToday && <span className="text-xs font-normal text-muted-foreground">(starts today)</span>}
                </dd>
              </dl>

              <div>
                <p className="mb-1.5 text-muted-foreground">Giờ hoàng đạo</p>
                <div className="flex flex-wrap gap-1.5">
                  {auspiciousHours(selectedLunar.jd).map((hour) => (
                    <span key={hour.chi} className="rounded-md border px-2 py-0.5 text-xs">
                      <span className="font-medium">{hour.chi}</span>{' '}
                      <span className="text-muted-foreground">{hour.range}</span>
                    </span>
                  ))}
                </div>
              </div>

              {(selectedHoliday || selectedEvents.length > 0) && (
                <div className="space-y-1.5">
                  <p className="text-muted-foreground">Events</p>
                  {selectedHoliday && (
                    <p className="flex items-center gap-2 rounded-md bg-rose-500/10 px-2.5 py-1.5 font-medium text-rose-600 dark:text-rose-300">
                      <CalendarHeart className="size-4 shrink-0" />
                      Day off · {selectedHoliday}
                    </p>
                  )}
                  {selectedEvents.map((event) => (
                    <EventRow key={event.name} event={event} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-base">Events in {MONTH_NAMES[monthAnchor.getMonth()]}</CardTitle>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">No special days this month.</p>
              ) : (
                <ul className="max-h-96 space-y-1 overflow-y-auto pr-1">
                  {upcoming.map((cell) => (
                    <li key={toDateStr(cell.date)}>
                      <button
                        type="button"
                        onClick={() => selectDay(cell.date)}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent/50',
                          isSameDay(cell.date, selected) && 'bg-accent/60',
                        )}
                      >
                        <span className="w-12 shrink-0 text-center">
                          <span className={cn('block font-semibold', cell.holiday && 'text-rose-500')}>
                            {String(cell.date.getDate()).padStart(2, '0')}/{String(cell.date.getMonth() + 1).padStart(2, '0')}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            ÂL {cell.lunar.day}/{cell.lunar.month}
                          </span>
                        </span>
                        <span className="min-w-0 space-y-0.5">
                          {cell.holiday && <span className="block font-medium text-rose-500">Day off · {cell.holiday}</span>}
                          {cell.events.map((event) => (
                            <span key={event.name} className={cn('block', event.major && 'font-medium')}>
                              {event.name}
                            </span>
                          ))}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppPageContainer>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  const Icon = event.kind === 'lunar' ? Moon : Sparkles;
  return (
    <p
      className={cn(
        'flex items-center gap-2 rounded-md px-2.5 py-1.5',
        event.major ? 'bg-amber-500/10 font-medium text-amber-700 dark:text-amber-300' : 'bg-muted',
      )}
    >
      <Icon className="size-4 shrink-0" />
      {event.name}
      <span className="ml-auto text-xs font-normal text-muted-foreground">{event.kind === 'lunar' ? 'Âm lịch' : 'Dương lịch'}</span>
    </p>
  );
}

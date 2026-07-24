'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { cn } from '@/shared/utils/cn';
import { formatDate } from '@/shared/utils/format';

// Self-contained so it doesn't depend on the overtime feature layer.
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function toStr(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function parse(v: string): Date {
  const [y, m, d] = v.split('-').map(Number);
  return new Date(y, m - 1, d);
}
/** Monday-based start of week. */
function startOfWeekMon(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface AppDatePickerProps {
  value?: string; // ISO yyyy-MM-dd
  onChange: (iso: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function AppDatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  className,
  id,
  disabled,
}: AppDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? parse(value) : null;
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // Jump the calendar to the currently selected month each time it opens.
      const base = (value ? parse(value) : null) ?? new Date();
      setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    }
    setOpen(next);
  };

  const month = viewMonth.getMonth();
  const cells = useMemo(() => {
    const gridStart = startOfWeekMon(viewMonth);
    return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  }, [viewMonth]);
  const today = new Date();

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            'flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn(!selected && 'text-muted-foreground')}>
            {selected ? formatDate(value!, 'dd/MM/yyyy') : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), month - 1, 1))}
            aria-label="Tháng trước"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="text-sm font-medium">
            Tháng {month + 1}, {viewMonth.getFullYear()}
          </span>
          <button
            type="button"
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), month + 1, 1))}
            aria-label="Tháng sau"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((w) => (
            <div key={w} className="pb-1 text-center text-[11px] font-medium text-muted-foreground">
              {w}
            </div>
          ))}
          {cells.map((d) => {
            const inMonth = d.getMonth() === month;
            const isSel = selected != null && sameDay(d, selected);
            const isToday = sameDay(d, today);
            return (
              <button
                key={toStr(d)}
                type="button"
                onClick={() => {
                  onChange(toStr(d));
                  setOpen(false);
                }}
                className={cn(
                  'flex size-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-accent',
                  !inMonth && 'text-muted-foreground/40',
                  isToday && !isSel && 'ring-1 ring-primary',
                  isSel && 'bg-primary text-primary-foreground hover:bg-primary',
                )}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

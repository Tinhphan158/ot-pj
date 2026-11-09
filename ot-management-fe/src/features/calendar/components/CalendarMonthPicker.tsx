'use client';

import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/cn';
import { MONTH_NAMES } from '@/shared/utils/format';

interface CalendarMonthPickerProps {
  /** First day of the month on show. */
  value: Date;
  onChange: (monthStart: Date) => void;
}

/**
 * Month + year jump, themed like the rest of the app — a native `<select>`
 * opens a browser-drawn list that ignores dark mode.
 */
export function CalendarMonthPicker({ value, onChange }: CalendarMonthPickerProps) {
  const [open, setOpen] = useState(false);
  // The year being browsed; only committed once a month is picked.
  const [year, setYear] = useState(value.getFullYear());
  const now = new Date();

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setYear(value.getFullYear());
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Choose month and year">
          {MONTH_NAMES[value.getMonth()].slice(0, 3)} {value.getFullYear()}
          <ChevronDown className="size-4 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <div className="mb-3 flex items-center justify-between">
          <Button variant="ghost" size="icon-sm" onClick={() => setYear((y) => y - 1)} aria-label="Previous year">
            <ChevronLeft />
          </Button>
          <span className="text-sm font-semibold tabular-nums">{year}</span>
          <Button variant="ghost" size="icon-sm" onClick={() => setYear((y) => y + 1)} aria-label="Next year">
            <ChevronRight />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {MONTH_NAMES.map((name, month) => {
            const isSelected = year === value.getFullYear() && month === value.getMonth();
            const isCurrent = year === now.getFullYear() && month === now.getMonth();
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(new Date(year, month, 1));
                  setOpen(false);
                }}
                className={cn(
                  'rounded-md px-2 py-1.5 text-sm transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected
                    ? 'bg-primary font-medium text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
                  !isSelected && isCurrent && 'font-medium text-primary ring-1 ring-primary/50',
                )}
              >
                {name.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

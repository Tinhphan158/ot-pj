'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/shared/utils/cn';

/**
 * Parse loose user input into a normalized 24h "HH:mm" string.
 * Accepts: "21" → 21:00, "9" → 09:00, "930" → 09:30, "2130" → 21:30,
 * "21:30" → 21:30, "9:5" → 09:05. Returns null if it can't be understood.
 */
function parseTime(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  let h: number;
  let m: number;
  if (s.includes(':')) {
    const [hh, mm = '0'] = s.split(':');
    h = parseInt(hh, 10);
    m = parseInt(mm || '0', 10);
  } else {
    const digits = s.replace(/\D/g, '');
    if (!digits) return null;
    if (digits.length <= 2) {
      h = parseInt(digits, 10);
      m = 0;
    } else if (digits.length === 3) {
      h = parseInt(digits.slice(0, 1), 10);
      m = parseInt(digits.slice(1), 10);
    } else {
      h = parseInt(digits.slice(0, 2), 10);
      m = parseInt(digits.slice(2, 4), 10);
    }
  }

  if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** "21:00" → "9:00 PM" for a friendly hint. */
function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h)) return '';
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

interface AppTimeInputProps {
  value?: string; // "HH:mm"
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
}

export function AppTimeInput({ value, onChange, placeholder = 'vd: 21 → 21:00', className, id, disabled }: AppTimeInputProps) {
  const [text, setText] = useState(value ?? '');

  // Keep local text in sync when the value changes from outside.
  useEffect(() => setText(value ?? ''), [value]);

  const commit = () => {
    const parsed = parseTime(text);
    if (parsed) {
      setText(parsed);
      if (parsed !== value) onChange(parsed);
    } else {
      setText(value ?? ''); // revert unparseable input
    }
  };

  const hint = value ? to12h(value) : '';

  return (
    <div
      className={cn(
        'flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <input
        id={id}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
      />
      {hint && <span className="ml-2 shrink-0 text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

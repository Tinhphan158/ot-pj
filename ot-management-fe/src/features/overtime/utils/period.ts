export type OvertimeView = 'day' | 'week' | 'month' | 'year';

export function toDateStr(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateStr(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Monday-based start of the week for the given date. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (d.getDay() + 6) % 7; // Monday = 0 … Sunday = 6
  d.setDate(d.getDate() - diff);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** [from, to) date-string range covering the period around `anchor` for the given view. */
export function getRange(view: OvertimeView, anchor: Date): { from: string; to: string } {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const d = anchor.getDate();

  let start: Date;
  let end: Date;
  switch (view) {
    case 'day':
      start = new Date(y, m, d);
      end = new Date(y, m, d + 1);
      break;
    case 'week':
      start = startOfWeek(anchor);
      end = addDays(start, 7);
      break;
    case 'month':
      start = new Date(y, m, 1);
      end = new Date(y, m + 1, 1);
      break;
    case 'year':
      start = new Date(y, 0, 1);
      end = new Date(y + 1, 0, 1);
      break;
  }
  return { from: toDateStr(start), to: toDateStr(end) };
}

/** Move the anchor forward/backward by one period of the given view. */
export function shiftAnchor(view: OvertimeView, anchor: Date, delta: number): Date {
  const d = new Date(anchor);
  switch (view) {
    case 'day':
      d.setDate(d.getDate() + delta);
      break;
    case 'week':
      d.setDate(d.getDate() + delta * 7);
      break;
    case 'month':
      d.setMonth(d.getMonth() + delta);
      break;
    case 'year':
      d.setFullYear(d.getFullYear() + delta);
      break;
  }
  return d;
}

/** "HH:MM" → minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

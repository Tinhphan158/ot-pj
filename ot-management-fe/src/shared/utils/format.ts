import { format, parseISO } from 'date-fns';

export function formatDate(value: string | Date | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, pattern);
}

/** Format decimal hours as "1h38p" (hours + minutes). Whole hours → "2h", under an hour → "38p". */
export function formatHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (totalMinutes === 0) return '0p';
  if (h === 0) return `${m}p`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}p`;
}

const WEEKDAYS_VI = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const WEEKDAYS_VI_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** Vietnamese weekday name, e.g. "Thứ 4". */
export function weekdayVi(value: string | Date, short = false): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return (short ? WEEKDAYS_VI_SHORT : WEEKDAYS_VI)[date.getDay()];
}

/** Date prefixed with its weekday, e.g. "Thứ 4, 09/07/2026". */
export function formatDateWithWeekday(value: string | Date, pattern = 'dd/MM/yyyy'): string {
  return `${weekdayVi(value)}, ${formatDate(value, pattern)}`;
}

export function formatMonthLabel(month: string): string {
  // month = "YYYY-MM"
  const [y, m] = month.split('-').map(Number);
  return format(new Date(y, m - 1, 1), 'MMM yyyy');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

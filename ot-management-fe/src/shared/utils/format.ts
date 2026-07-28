import { format, parseISO } from 'date-fns';

export function formatDate(value: string | Date | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? parseISO(value) : value;
  return format(date, pattern);
}

/** Format decimal hours as "1h38m" (hours + minutes). Whole hours → "2h", under an hour → "38m". */
export function formatHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (totalMinutes === 0) return '0m';
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}m`;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Indexed 0-11, so it lines up with `Date#getMonth()` and the OT cycle label month. */
export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Weekday name, e.g. "Wednesday". */
export function weekdayName(value: string | Date, short = false): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  return (short ? WEEKDAYS_SHORT : WEEKDAYS)[date.getDay()];
}

/** Date prefixed with its weekday, e.g. "Wednesday, 09/07/2026". */
export function formatDateWithWeekday(value: string | Date, pattern = 'dd/MM/yyyy'): string {
  return `${weekdayName(value)}, ${formatDate(value, pattern)}`;
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

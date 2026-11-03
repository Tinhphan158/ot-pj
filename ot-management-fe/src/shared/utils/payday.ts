/**
 * Salary lands on the last day of the month; when that falls on a weekend it
 * moves back to the Friday before.
 */
export function paydayOf(year: number, month: number): Date {
  const last = new Date(year, month + 1, 0);
  const dow = last.getDay();
  if (dow === 6) last.setDate(last.getDate() - 1);
  else if (dow === 0) last.setDate(last.getDate() - 2);
  return last;
}

export function isPayday(date: Date = new Date()): boolean {
  const payday = paydayOf(date.getFullYear(), date.getMonth());
  return payday.getDate() === date.getDate();
}

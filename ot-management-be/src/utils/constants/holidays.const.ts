/**
 * Vietnamese public holidays, keyed by YYYY-MM-DD. Overtime on these days is
 * paid at the holiday rate and may be registered across the whole day-off
 * window (see `overtimeWindowFor`).
 *
 * The lunar holidays (Tết, Hùng Kings) move every year and the government
 * announces the exact days off — including any swapped working days — late in
 * the year before. Check each year against the official announcement and add
 * the next year's Tết here as soon as it is published.
 */
export const VN_HOLIDAYS: Readonly<Record<string, string>> = {
  // 2025
  '2025-01-01': "New Year's Day",
  '2025-01-27': 'Lunar New Year',
  '2025-01-28': 'Lunar New Year',
  '2025-01-29': 'Lunar New Year',
  '2025-01-30': 'Lunar New Year',
  '2025-01-31': 'Lunar New Year',
  '2025-04-07': "Hùng Kings' Commemoration",
  '2025-04-30': 'Reunification Day',
  '2025-05-01': 'International Labour Day',
  '2025-09-01': 'National Day',
  '2025-09-02': 'National Day',

  // 2026
  '2026-01-01': "New Year's Day",
  '2026-02-16': 'Lunar New Year',
  '2026-02-17': 'Lunar New Year',
  '2026-02-18': 'Lunar New Year',
  '2026-02-19': 'Lunar New Year',
  '2026-02-20': 'Lunar New Year',
  '2026-04-26': "Hùng Kings' Commemoration",
  '2026-04-27': "Hùng Kings' Commemoration (day in lieu)",
  '2026-04-30': 'Reunification Day',
  '2026-05-01': 'International Labour Day',
  '2026-09-01': 'National Day',
  '2026-09-02': 'National Day',
  '2026-11-24': 'Vietnam Culture Day',

  // 2027 — Tết not announced yet; add it once it is.
  '2027-01-01': "New Year's Day",
  '2027-04-16': "Hùng Kings' Commemoration",
  '2027-04-30': 'Reunification Day',
  '2027-05-01': 'International Labour Day',
  '2027-09-02': 'National Day',
  '2027-09-03': 'National Day',
  '2027-11-24': 'Vietnam Culture Day',
};

import {
  FALLBACK_SEASONAL_THEME_ID,
  SEASONAL_THEMES,
  SEASONAL_THEME_OVERRIDE,
  type SeasonalPeriod,
  type SeasonalTheme,
} from '@/shared/constants/seasonal-theme';

/**
 * Gregorian date of Lunar New Year's Day, in the Vietnam time zone. The lunar
 * calendar has no short formula, hence the lookup table; a year that is missing
 * simply skips the Tet theme and falls through to the matching season.
 */
const TET_DATES: Record<number, string> = {
  2024: '2024-02-10',
  2025: '2025-01-29',
  2026: '2026-02-17',
  2027: '2027-02-06',
  2028: '2028-01-26',
  2029: '2029-02-13',
  2030: '2030-02-03',
  2031: '2031-01-23',
  2032: '2032-02-11',
  2033: '2033-01-31',
  2034: '2034-02-19',
  2035: '2035-02-08',
};

/** The 15th of the 8th lunar month — Mid-Autumn Festival. */
const MID_AUTUMN_DATES: Record<number, string> = {
  2024: '2024-09-17',
  2025: '2025-10-06',
  2026: '2026-09-25',
  2027: '2027-09-15',
  2028: '2028-10-03',
  2029: '2029-09-22',
  2030: '2030-09-12',
  2031: '2031-10-01',
  2032: '2032-09-19',
  2033: '2033-09-08',
  2034: '2034-09-27',
  2035: '2035-09-16',
};

const LUNAR_TABLES = { tet: TET_DATES, 'mid-autumn': MID_AUTUMN_DATES };

/** Whole days since the epoch, dropping the time part so dates compare as dates. */
function toDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

function parseIsoDay(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function matchesPeriod(date: Date, period: SeasonalPeriod): boolean {
  if (period.kind === 'lunar') {
    const iso = LUNAR_TABLES[period.anchor][date.getFullYear()];
    if (!iso) return false;

    const anchor = parseIsoDay(iso);
    const today = toDayNumber(date);
    return today >= anchor - period.before && today <= anchor + period.after;
  }

  // Compare on an MMDD scale so the match is year-independent.
  const today = (date.getMonth() + 1) * 100 + date.getDate();
  const from = period.from[0] * 100 + period.from[1];
  const to = period.to[0] * 100 + period.to[1];

  // A range that wraps past new year (e.g. 1 Nov → 31 Jan) needs OR, not AND.
  return from <= to ? today >= from && today <= to : today >= from || today <= to;
}

/** Theme matching `date` — first match wins, so array order is priority order. */
export function resolveSeasonalTheme(date: Date = new Date()): SeasonalTheme {
  const matched = SEASONAL_THEMES.find((theme) => matchesPeriod(date, theme.period));
  if (matched) return matched;

  return (
    SEASONAL_THEMES.find((theme) => theme.id === FALLBACK_SEASONAL_THEME_ID) ?? SEASONAL_THEMES[0]
  );
}

/** Like `resolveSeasonalTheme`, but honours `SEASONAL_THEME_OVERRIDE`. */
export function getSeasonalTheme(date: Date = new Date()): SeasonalTheme {
  if (SEASONAL_THEME_OVERRIDE !== 'auto') {
    const forced = SEASONAL_THEMES.find((theme) => theme.id === SEASONAL_THEME_OVERRIDE);
    if (forced) return forced;
  }
  return resolveSeasonalTheme(date);
}

/** Milliseconds until the next local midnight, to reschedule the theme without a reload. */
export function msUntilNextMidnight(from: Date = new Date()): number {
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
  return next.getTime() - from.getTime();
}

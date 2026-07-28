import {
  FALLBACK_SEASONAL_THEME_ID,
  SEASONAL_THEMES,
  SEASONAL_THEME_OVERRIDE,
  type SeasonalPeriod,
  type SeasonalTheme,
} from '@/shared/constants/seasonal-theme';

/**
 * Mùng 1 Tết Nguyên Đán (dương lịch) theo múi giờ Việt Nam.
 * Âm lịch không tính được bằng công thức ngắn gọn nên tra bảng; năm nào không có
 * trong bảng thì theme Tết bị bỏ qua và rơi về theme mùa tương ứng.
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

/** Rằm tháng Tám — Tết Trung thu. */
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

/** Số ngày kể từ epoch, bỏ hoàn toàn phần giờ — so sánh ngày với ngày. */
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

  // So sánh trên thang MMDD nên không phụ thuộc năm.
  const today = (date.getMonth() + 1) * 100 + date.getDate();
  const from = period.from[0] * 100 + period.from[1];
  const to = period.to[0] * 100 + period.to[1];

  // Khoảng vắt qua giao thừa (ví dụ 1/11 → 31/1) thì điều kiện là HOẶC.
  return from <= to ? today >= from && today <= to : today >= from || today <= to;
}

/** Theme khớp ngày `date` — lấy phần tử khớp đầu tiên nên thứ tự mảng là thứ tự ưu tiên. */
export function resolveSeasonalTheme(date: Date = new Date()): SeasonalTheme {
  const matched = SEASONAL_THEMES.find((theme) => matchesPeriod(date, theme.period));
  if (matched) return matched;

  return (
    SEASONAL_THEMES.find((theme) => theme.id === FALLBACK_SEASONAL_THEME_ID) ?? SEASONAL_THEMES[0]
  );
}

/** Như `resolveSeasonalTheme` nhưng tôn trọng `SEASONAL_THEME_OVERRIDE`. */
export function getSeasonalTheme(date: Date = new Date()): SeasonalTheme {
  if (SEASONAL_THEME_OVERRIDE !== 'auto') {
    const forced = SEASONAL_THEMES.find((theme) => theme.id === SEASONAL_THEME_OVERRIDE);
    if (forced) return forced;
  }
  return resolveSeasonalTheme(date);
}

/** Mili giây tới 0h00 hôm sau — để hẹn giờ đổi theme mà không cần tải lại trang. */
export function msUntilNextMidnight(from: Date = new Date()): number {
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
  return next.getTime() - from.getTime();
}

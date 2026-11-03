/**
 * Vietnamese lunar calendar — Ho Ngoc Duc's astronomical algorithm, computed
 * for the Vietnam time zone (UTC+7). Note that the Vietnamese and Chinese
 * calendars occasionally differ because of that time zone (e.g. Tết 1985).
 *
 * All functions take/return plain day/month/year numbers (month 1-12) so they
 * stay independent of the browser's own time zone.
 */

const TIME_ZONE = 7;
const PI = Math.PI;

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  /** True for the intercalary ("nhuận") month. */
  leap: boolean;
  /** Julian day number of the solar date this was converted from. */
  jd: number;
}

/** Julian day number of a Gregorian (or, before 1582, Julian) date. */
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

export function jdToDate(jd: number): { day: number; month: number; year: number } {
  let b: number;
  let c: number;
  if (jd > 2299160) {
    const a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: b * 100 + d - 4800 + Math.floor(m / 10),
  };
}

/** Julian date (fractional) of the k-th new moon after 1900-01-01. */
function newMoon(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltaT =
    T < -11
      ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
      : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return jd1 + C1 - deltaT;
}

function newMoonDay(k: number): number {
  return Math.floor(newMoon(k) + 0.5 + TIME_ZONE / 24);
}

/** Sun's ecliptic longitude in radians [0, 2π) at the given Julian date. */
function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L -= PI * 2 * Math.floor(L / (PI * 2));
  return L;
}

/** Which of the 12 major solar terms (30° each) the local start of the day falls in. */
function sunSector(dayNumber: number): number {
  return Math.floor((sunLongitude(dayNumber - 0.5 - TIME_ZONE / 24) / PI) * 6);
}

/** Julian day the 11th lunar month (the one holding the winter solstice) of `yy` starts. */
function lunarMonth11(yy: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  const nm = newMoonDay(k);
  return sunSector(nm) >= 9 ? newMoonDay(k - 1) : nm;
}

/** Offset (in months after month 11) of the leap month in a 13-month year. */
function leapMonthOffset(a11: number): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last: number;
  let i = 1;
  let arc = sunSector(newMoonDay(k + i));
  do {
    last = arc;
    i++;
    arc = sunSector(newMoonDay(k + i));
  } while (arc !== last && i < 14);
  return i - 1;
}

export function solarToLunar(dd: number, mm: number, yy: number): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = newMoonDay(k + 1);
  if (monthStart > dayNumber) monthStart = newMoonDay(k);

  let a11 = lunarMonth11(yy);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = lunarMonth11(yy - 1);
  } else {
    lunarYear = yy + 1;
    b11 = lunarMonth11(yy + 1);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let leap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapDiff = leapMonthOffset(a11);
    if (diff >= leapDiff) {
      lunarMonth = diff + 10;
      if (diff === leapDiff) leap = true;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;

  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap, jd: dayNumber };
}

export function lunarOf(date: Date): LunarDate {
  return solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
}

// ───────────── Can Chi (sexagenary cycle) ─────────────

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

/** The zodiac animal of each Chi, Vietnamese style (Mão = cat). */
export const CHI_ANIMALS = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Lợn'];

export function yearCanChi(lunarYear: number): string {
  return `${CAN[(lunarYear + 6) % 10]} ${CHI[(lunarYear + 8) % 12]}`;
}

export function yearAnimal(lunarYear: number): string {
  return CHI_ANIMALS[(lunarYear + 8) % 12];
}

export function monthCanChi(lunar: LunarDate): string {
  const name = `${CAN[(lunar.year * 12 + lunar.month + 3) % 10]} ${CHI[(lunar.month + 1) % 12]}`;
  return lunar.leap ? `${name} (nhuận)` : name;
}

export function dayCanChi(jd: number): string {
  return `${CAN[(jd + 9) % 10]} ${CHI[(jd + 1) % 12]}`;
}

/** Each day's auspicious hours by the day's Chi (mod 6); one flag per two-hour Chi from Tý. */
const AUSPICIOUS_HOURS = [
  '110100101100',
  '001101001011',
  '110011010010',
  '101100110100',
  '001011001101',
  '010010110011',
];

/** Giờ hoàng đạo, e.g. `{ chi: 'Tý', range: '23-1' }`. */
export function auspiciousHours(jd: number): { chi: string; range: string }[] {
  const pattern = AUSPICIOUS_HOURS[((jd + 1) % 12) % 6];
  const hours: { chi: string; range: string }[] = [];
  for (let i = 0; i < 12; i++) {
    if (pattern[i] !== '1') continue;
    const start = (i * 2 + 23) % 24;
    hours.push({ chi: CHI[i], range: `${start}-${(start + 2) % 24}h` });
  }
  return hours;
}

// ───────────── Solar terms (tiết khí) ─────────────

/** The 24 solar terms, starting at 0° (spring equinox). */
const SOLAR_TERMS = [
  'Xuân phân',
  'Thanh minh',
  'Cốc vũ',
  'Lập hạ',
  'Tiểu mãn',
  'Mang chủng',
  'Hạ chí',
  'Tiểu thử',
  'Đại thử',
  'Lập thu',
  'Xử thử',
  'Bạch lộ',
  'Thu phân',
  'Hàn lộ',
  'Sương giáng',
  'Lập đông',
  'Tiểu tuyết',
  'Đại tuyết',
  'Đông chí',
  'Tiểu hàn',
  'Đại hàn',
  'Lập xuân',
  'Vũ thủy',
  'Kinh trập',
];

function solarTermIndex(jd: number): number {
  return Math.floor((sunLongitude(jd - 0.5 - TIME_ZONE / 24) / PI) * 12);
}

/** The solar term the day falls in, and whether that term begins on this day. */
export function solarTerm(jd: number): { name: string; startsToday: boolean } {
  const index = solarTermIndex(jd + 1);
  return { name: SOLAR_TERMS[index], startsToday: solarTermIndex(jd) !== index };
}

// ───────────── Festivals & observances ─────────────

export type CalendarEventKind = 'solar' | 'lunar';

export interface CalendarEvent {
  name: string;
  kind: CalendarEventKind;
  /** Traditional festivals and national days get more emphasis in the grid. */
  major?: boolean;
}

/** Observances on fixed Gregorian dates, keyed "D/M". */
const SOLAR_EVENTS: Record<string, CalendarEvent[]> = {
  '1/1': [{ name: 'Tết Dương lịch', kind: 'solar', major: true }],
  '9/1': [{ name: 'Ngày Học sinh – Sinh viên Việt Nam', kind: 'solar' }],
  '3/2': [{ name: 'Ngày thành lập Đảng Cộng sản Việt Nam', kind: 'solar' }],
  '14/2': [{ name: 'Lễ Tình nhân (Valentine)', kind: 'solar' }],
  '27/2': [{ name: 'Ngày Thầy thuốc Việt Nam', kind: 'solar' }],
  '8/3': [{ name: 'Ngày Quốc tế Phụ nữ', kind: 'solar' }],
  '26/3': [{ name: 'Ngày thành lập Đoàn TNCS Hồ Chí Minh', kind: 'solar' }],
  '1/4': [{ name: 'Ngày Cá tháng Tư', kind: 'solar' }],
  '30/4': [{ name: 'Ngày Giải phóng miền Nam, thống nhất đất nước', kind: 'solar', major: true }],
  '1/5': [{ name: 'Ngày Quốc tế Lao động', kind: 'solar', major: true }],
  '7/5': [{ name: 'Chiến thắng Điện Biên Phủ', kind: 'solar' }],
  '19/5': [{ name: 'Ngày sinh Chủ tịch Hồ Chí Minh', kind: 'solar' }],
  '1/6': [{ name: 'Ngày Quốc tế Thiếu nhi', kind: 'solar' }],
  '28/6': [{ name: 'Ngày Gia đình Việt Nam', kind: 'solar' }],
  '27/7': [{ name: 'Ngày Thương binh Liệt sĩ', kind: 'solar' }],
  '19/8': [{ name: 'Ngày Cách mạng tháng Tám', kind: 'solar' }],
  '2/9': [{ name: 'Quốc khánh Việt Nam', kind: 'solar', major: true }],
  '10/10': [{ name: 'Ngày Giải phóng Thủ đô', kind: 'solar' }],
  '13/10': [{ name: 'Ngày Doanh nhân Việt Nam', kind: 'solar' }],
  '20/10': [{ name: 'Ngày Phụ nữ Việt Nam', kind: 'solar' }],
  '31/10': [{ name: 'Halloween', kind: 'solar' }],
  '20/11': [{ name: 'Ngày Nhà giáo Việt Nam', kind: 'solar' }],
  '24/11': [{ name: 'Ngày Văn hóa Việt Nam', kind: 'solar' }],
  '22/12': [{ name: 'Ngày thành lập Quân đội Nhân dân Việt Nam', kind: 'solar' }],
  '24/12': [{ name: 'Đêm Giáng sinh', kind: 'solar' }],
  '25/12': [{ name: 'Lễ Giáng sinh', kind: 'solar' }],
};

/** Traditional festivals on lunar dates, keyed "D/M" (never on a leap month). */
const LUNAR_EVENTS: Record<string, CalendarEvent[]> = {
  '1/1': [{ name: 'Tết Nguyên Đán', kind: 'lunar', major: true }],
  '2/1': [{ name: 'Mùng 2 Tết', kind: 'lunar', major: true }],
  '3/1': [{ name: 'Mùng 3 Tết', kind: 'lunar', major: true }],
  '15/1': [{ name: 'Tết Nguyên Tiêu (Rằm tháng Giêng)', kind: 'lunar', major: true }],
  '3/3': [{ name: 'Tết Hàn thực', kind: 'lunar' }],
  '10/3': [{ name: 'Giỗ Tổ Hùng Vương', kind: 'lunar', major: true }],
  '15/4': [{ name: 'Lễ Phật Đản', kind: 'lunar' }],
  '5/5': [{ name: 'Tết Đoan Ngọ', kind: 'lunar', major: true }],
  '7/7': [{ name: 'Lễ Thất Tịch', kind: 'lunar' }],
  '15/7': [{ name: 'Lễ Vu Lan', kind: 'lunar', major: true }],
  '15/8': [{ name: 'Tết Trung Thu', kind: 'lunar', major: true }],
  '9/9': [{ name: 'Tết Trùng Cửu', kind: 'lunar' }],
  '10/10': [{ name: 'Tết Thường Tân', kind: 'lunar' }],
  '15/10': [{ name: 'Tết Hạ Nguyên', kind: 'lunar' }],
  '23/12': [{ name: 'Ông Công Ông Táo', kind: 'lunar', major: true }],
};

export function eventsFor(date: Date, lunar: LunarDate = lunarOf(date)): CalendarEvent[] {
  const events = [...(SOLAR_EVENTS[`${date.getDate()}/${date.getMonth() + 1}`] ?? [])];
  if (!lunar.leap) {
    events.push(...(LUNAR_EVENTS[`${lunar.day}/${lunar.month}`] ?? []));
    // The 12th month has 29 or 30 days, so New Year's Eve is "whatever day precedes Tết".
    if (lunar.month === 12 && lunar.day >= 29) {
      const next = jdToDate(lunar.jd + 1);
      const nextLunar = solarToLunar(next.day, next.month, next.year);
      if (nextLunar.day === 1 && nextLunar.month === 1) {
        events.push({ name: 'Giao thừa', kind: 'lunar', major: true });
      }
    }
  }
  return events;
}

/** Short lunar label for a grid cell: the month on the 1st ("1/8"), otherwise the day. */
export function shortLunarLabel(lunar: LunarDate): string {
  if (lunar.day === 1) return `${lunar.day}/${lunar.month}${lunar.leap ? 'N' : ''}`;
  return String(lunar.day);
}

/** e.g. "15 tháng 8 năm Bính Ngọ", with "nhuận" for a leap month. */
export function formatLunarDate(lunar: LunarDate): string {
  return `${lunar.day} tháng ${lunar.month}${lunar.leap ? ' nhuận' : ''} năm ${yearCanChi(lunar.year)}`;
}

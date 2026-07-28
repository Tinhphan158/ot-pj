/**
 * Bảng màu nền theo mùa / theo dịp lễ.
 *
 * Mỗi theme khai báo một `period` (khoảng ngày). Hàm `resolveSeasonalTheme()`
 * trong `@/shared/utils/seasonalTheme` so ngày hiện tại với các khoảng này và
 * trả về theme khớp ĐẦU TIÊN — nên thứ tự trong `SEASONAL_THEMES` chính là thứ
 * tự ưu tiên: các dịp lễ đứng trước, 4 mùa đứng cuối làm fallback.
 *
 * Muốn thêm một dịp mới: thêm một phần tử vào mảng, đặt phía trên nhóm 4 mùa.
 * Muốn xem thử một theme bất kỳ: đổi `SEASONAL_THEME_OVERRIDE`.
 */

export type SeasonalThemeId =
  | 'tet'
  | 'new-year'
  | 'christmas'
  | 'reunification'
  | 'national-day'
  | 'mid-autumn'
  | 'womens-day'
  | 'vn-womens-day'
  | 'spring'
  | 'summer'
  | 'autumn'
  | 'winter';

/** Hình dạng hạt rơi/bay trong nền. */
export type ParticleShape = 'round' | 'glow' | 'petal' | 'leaf' | 'confetti' | 'sparkle';

/** Kiểu chuyển động của hạt. */
export type ParticleMotion = 'fall' | 'spin-fall' | 'rise' | 'drift';

/**
 * Khoảng thời gian áp dụng theme.
 * - `fixed`: ngày dương lịch cố định, dạng [tháng, ngày]. Cho phép vắt qua năm
 *   (ví dụ mùa đông 1/11 → 31/1).
 * - `lunar`: neo vào một ngày âm lịch (tra bảng), mở rộng `before` ngày trước và
 *   `after` ngày sau.
 */
export type SeasonalPeriod =
  | { kind: 'fixed'; from: readonly [number, number]; to: readonly [number, number] }
  | { kind: 'lunar'; anchor: 'tet' | 'mid-autumn'; before: number; after: number };

export interface SeasonalParticles {
  shape: ParticleShape;
  motion: ParticleMotion;
  count: number;
  /** Khoảng kích thước (px): [min, max). */
  size: readonly [number, number];
  /** Tỉ lệ cao/rộng — cánh hoa và lá dẹt hơn hình tròn. */
  aspect?: number;
  /** Khoảng thời lượng một vòng animation (giây): [min, max). */
  duration: readonly [number, number];
  colors: { light: readonly string[]; dark: readonly string[] };
}

/** Quầng sáng lớn cố định: mặt trời mùa hè, trăng rằm trung thu... */
export interface SeasonalOrb {
  light: string;
  dark: string;
  left: string;
  top: string;
  /** Đường kính, nên dùng đơn vị vw để co giãn theo màn hình. */
  size: string;
}

export interface SeasonalTheme {
  id: SeasonalThemeId;
  label: string;
  period: SeasonalPeriod;
  /** Giá trị CSS `background` cho lớp nền, tách riêng light/dark. */
  sky: { light: string; dark: string };
  /** 3 vệt mây màu trôi chậm phía sau nội dung. */
  nebulas: readonly [string, string, string];
  particles: SeasonalParticles;
  orb?: SeasonalOrb;
  /** Trường sao — chỉ hiện ở dark mode (nền sáng sẽ trông như bụi bẩn). */
  stars: boolean;
  /** Sao băng — cũng chỉ hiện ở dark mode. */
  meteors: boolean;
}

/** 8/3 và 20/10 dùng chung một bộ màu, khai báo một lần rồi tái sử dụng. */
const FLORAL_STYLE = {
  sky: {
    light: `radial-gradient(ellipse 80% 60% at 15% -10%, rgba(236, 72, 153, 0.2), transparent 60%),
      radial-gradient(ellipse 70% 50% at 88% 0%, rgba(168, 85, 247, 0.16), transparent 60%),
      linear-gradient(180deg, #fff5fa 0%, #fdf7ff 55%, #ffffff 100%)`,
    dark: `radial-gradient(ellipse 90% 60% at 20% -15%, rgba(157, 23, 77, 0.45), transparent 60%),
      radial-gradient(ellipse 70% 55% at 88% 0%, rgba(126, 34, 206, 0.35), transparent 60%),
      linear-gradient(180deg, #140510 0%, #1b0a1c 55%, #07030a 100%)`,
  },
  nebulas: ['rgba(236,72,153,0.48)', 'rgba(168,85,247,0.42)', 'rgba(251,207,232,0.4)'],
  particles: {
    shape: 'petal',
    motion: 'spin-fall',
    count: 30,
    size: [5, 11],
    aspect: 0.62,
    duration: [10, 20],
    colors: {
      light: ['#f472b6', '#e879f9', '#fbcfe8'],
      dark: ['#f9a8d4', '#f0abfc', '#fda4af'],
    },
  },
  stars: true,
  meteors: false,
} as const satisfies Omit<SeasonalTheme, 'id' | 'label' | 'period'>;

export const SEASONAL_THEMES: readonly SeasonalTheme[] = [
  // ----- Dịp lễ (ưu tiên cao hơn 4 mùa) -----------------------------------
  {
    id: 'tet',
    label: 'Tết Nguyên Đán',
    // Từ 28 tháng Chạp đến hết mùng 6.
    period: { kind: 'lunar', anchor: 'tet', before: 3, after: 6 },
    sky: {
      light: `radial-gradient(ellipse 80% 60% at 15% -10%, rgba(239, 68, 68, 0.2), transparent 60%),
        radial-gradient(ellipse 70% 50% at 88% 0%, rgba(250, 204, 21, 0.24), transparent 60%),
        linear-gradient(180deg, #fff6f2 0%, #fffbf0 55%, #ffffff 100%)`,
      dark: `radial-gradient(ellipse 90% 60% at 20% -15%, rgba(153, 27, 27, 0.55), transparent 60%),
        radial-gradient(ellipse 70% 55% at 88% 0%, rgba(161, 98, 7, 0.42), transparent 60%),
        linear-gradient(180deg, #1a0606 0%, #230a08 55%, #0b0303 100%)`,
    },
    nebulas: ['rgba(239,68,68,0.5)', 'rgba(250,204,21,0.45)', 'rgba(249,115,22,0.4)'],
    orb: {
      light: 'rgba(250, 204, 21, 0.4)',
      dark: 'rgba(239, 68, 68, 0.35)',
      left: '6%',
      top: '-14%',
      size: '38vw',
    },
    particles: {
      shape: 'petal',
      motion: 'spin-fall',
      count: 30,
      size: [5, 11],
      aspect: 0.62,
      duration: [10, 20],
      colors: {
        light: ['#fbbf24', '#f472b6', '#ef4444'],
        dark: ['#fcd34d', '#f9a8d4', '#fb7185'],
      },
    },
    stars: true,
    meteors: false,
  },
  {
    id: 'new-year',
    label: 'Tết Dương lịch',
    period: { kind: 'fixed', from: [12, 30], to: [1, 2] },
    sky: {
      light: `radial-gradient(ellipse 80% 60% at 20% -10%, rgba(168, 85, 247, 0.2), transparent 60%),
        radial-gradient(ellipse 70% 50% at 85% 0%, rgba(250, 204, 21, 0.2), transparent 60%),
        linear-gradient(180deg, #faf5ff 0%, #fdfaff 55%, #ffffff 100%)`,
      dark: `radial-gradient(ellipse 90% 60% at 20% -15%, rgba(126, 34, 206, 0.48), transparent 60%),
        radial-gradient(ellipse 70% 55% at 85% 0%, rgba(161, 98, 7, 0.34), transparent 60%),
        linear-gradient(180deg, #0b0518 0%, #120a24 55%, #05030c 100%)`,
    },
    nebulas: ['rgba(168,85,247,0.5)', 'rgba(250,204,21,0.42)', 'rgba(56,189,248,0.4)'],
    particles: {
      shape: 'confetti',
      motion: 'spin-fall',
      count: 42,
      size: [3, 8],
      aspect: 0.5,
      duration: [7, 15],
      colors: {
        light: ['#a855f7', '#facc15', '#38bdf8', '#f472b6'],
        dark: ['#c084fc', '#fde047', '#7dd3fc', '#f9a8d4'],
      },
    },
    stars: true,
    meteors: true,
  },
  {
    id: 'christmas',
    label: 'Giáng sinh (Noel)',
    period: { kind: 'fixed', from: [12, 18], to: [12, 26] },
    sky: {
      light: `radial-gradient(ellipse 80% 60% at 15% -10%, rgba(220, 38, 38, 0.16), transparent 60%),
        radial-gradient(ellipse 70% 50% at 88% 0%, rgba(22, 163, 74, 0.18), transparent 60%),
        linear-gradient(180deg, #f4fbf5 0%, #fdf7f7 55%, #ffffff 100%)`,
      dark: `radial-gradient(ellipse 90% 60% at 20% -15%, rgba(20, 83, 45, 0.5), transparent 60%),
        radial-gradient(ellipse 70% 55% at 88% 0%, rgba(153, 27, 27, 0.4), transparent 60%),
        linear-gradient(180deg, #04120a 0%, #071a10 55%, #020806 100%)`,
    },
    nebulas: ['rgba(22,163,74,0.48)', 'rgba(220,38,38,0.42)', 'rgba(250,204,21,0.32)'],
    particles: {
      shape: 'round',
      motion: 'fall',
      count: 44,
      size: [2, 6],
      duration: [8, 18],
      colors: {
        light: ['rgba(148,163,184,0.6)', 'rgba(191,219,254,0.75)'],
        dark: ['rgba(255,255,255,0.9)', 'rgba(224,242,254,0.8)'],
      },
    },
    stars: true,
    meteors: false,
  },
  {
    id: 'reunification',
    label: 'Giải phóng miền Nam 30/4 & Quốc tế Lao động 1/5',
    period: { kind: 'fixed', from: [4, 29], to: [5, 2] },
    sky: {
      light: `radial-gradient(ellipse 80% 60% at 18% -10%, rgba(220, 38, 38, 0.2), transparent 60%),
        radial-gradient(ellipse 70% 50% at 88% 0%, rgba(250, 204, 21, 0.22), transparent 60%),
        linear-gradient(180deg, #fff5f5 0%, #fffdf3 55%, #ffffff 100%)`,
      dark: `radial-gradient(ellipse 90% 60% at 20% -15%, rgba(153, 27, 27, 0.55), transparent 60%),
        radial-gradient(ellipse 70% 55% at 88% 0%, rgba(161, 98, 7, 0.4), transparent 60%),
        linear-gradient(180deg, #170404 0%, #1f0807 55%, #0a0202 100%)`,
    },
    nebulas: ['rgba(220,38,38,0.5)', 'rgba(250,204,21,0.45)', 'rgba(248,113,113,0.35)'],
    particles: {
      shape: 'sparkle',
      motion: 'rise',
      count: 26,
      size: [4, 9],
      duration: [10, 20],
      colors: {
        light: ['rgba(250,204,21,0.75)', 'rgba(251,191,36,0.6)'],
        dark: ['#fde047', '#fef08a'],
      },
    },
    stars: true,
    meteors: false,
  },
  {
    id: 'national-day',
    label: 'Quốc khánh 2/9',
    period: { kind: 'fixed', from: [9, 1], to: [9, 3] },
    sky: {
      light: `radial-gradient(ellipse 75% 55% at 50% -14%, rgba(250, 204, 21, 0.26), transparent 62%),
        radial-gradient(ellipse 85% 60% at 12% 5%, rgba(220, 38, 38, 0.2), transparent 60%),
        linear-gradient(180deg, #fff6f4 0%, #fffcf2 55%, #ffffff 100%)`,
      dark: `radial-gradient(ellipse 80% 55% at 50% -12%, rgba(180, 83, 9, 0.42), transparent 62%),
        radial-gradient(ellipse 95% 65% at 14% 5%, rgba(153, 27, 27, 0.5), transparent 60%),
        linear-gradient(180deg, #180505 0%, #210907 55%, #090202 100%)`,
    },
    nebulas: ['rgba(220,38,38,0.52)', 'rgba(250,204,21,0.48)', 'rgba(249,115,22,0.35)'],
    orb: {
      light: 'rgba(250, 204, 21, 0.4)',
      dark: 'rgba(250, 204, 21, 0.3)',
      left: '50%',
      top: '-18%',
      size: '40vw',
    },
    particles: {
      shape: 'sparkle',
      motion: 'rise',
      count: 32,
      size: [4, 10],
      duration: [9, 18],
      colors: {
        light: ['rgba(250,204,21,0.8)', 'rgba(248,113,113,0.55)'],
        dark: ['#fde047', '#fca5a5'],
      },
    },
    stars: true,
    meteors: true,
  },
  {
    id: 'mid-autumn',
    label: 'Tết Trung thu',
    period: { kind: 'lunar', anchor: 'mid-autumn', before: 3, after: 2 },
    sky: {
      light: `radial-gradient(ellipse 75% 55% at 80% -12%, rgba(251, 191, 36, 0.28), transparent 62%),
        radial-gradient(ellipse 85% 60% at 12% 5%, rgba(249, 115, 22, 0.16), transparent 60%),
        linear-gradient(180deg, #fffaf0 0%, #fffdf7 55%, #ffffff 100%)`,
      dark: `radial-gradient(ellipse 80% 55% at 78% -10%, rgba(217, 119, 6, 0.4), transparent 62%),
        radial-gradient(ellipse 90% 60% at 15% 8%, rgba(120, 53, 15, 0.38), transparent 60%),
        linear-gradient(180deg, #0d0a04 0%, #16110a 55%, #060403 100%)`,
    },
    nebulas: ['rgba(251,191,36,0.48)', 'rgba(249,115,22,0.42)', 'rgba(220,38,38,0.3)'],
    orb: {
      light: 'rgba(254, 240, 138, 0.6)',
      dark: 'rgba(254, 249, 195, 0.38)',
      left: '72%',
      top: '-6%',
      size: '26vw',
    },
    // Đèn lồng thả trôi lên.
    particles: {
      shape: 'glow',
      motion: 'rise',
      count: 22,
      size: [4, 9],
      duration: [14, 28],
      colors: {
        light: ['rgba(249,115,22,0.6)', 'rgba(251,191,36,0.65)'],
        dark: ['#fbbf24', '#fb923c', '#fde68a'],
      },
    },
    stars: true,
    meteors: false,
  },
  {
    id: 'womens-day',
    label: 'Quốc tế Phụ nữ 8/3',
    period: { kind: 'fixed', from: [3, 7], to: [3, 9] },
    ...FLORAL_STYLE,
  },
  {
    id: 'vn-womens-day',
    label: 'Phụ nữ Việt Nam 20/10',
    period: { kind: 'fixed', from: [10, 19], to: [10, 21] },
    ...FLORAL_STYLE,
  },

  // ----- 4 mùa (fallback, phủ kín 365 ngày) --------------------------------
  {
    id: 'spring',
    label: 'Mùa Xuân',
    period: { kind: 'fixed', from: [2, 1], to: [4, 30] },
    sky: {
      light: `radial-gradient(ellipse 80% 60% at 15% -10%, rgba(244, 114, 182, 0.18), transparent 60%),
        radial-gradient(ellipse 70% 50% at 88% 0%, rgba(134, 239, 172, 0.2), transparent 60%),
        linear-gradient(180deg, #fff5f9 0%, #fdfefb 55%, #ffffff 100%)`,
      dark: `radial-gradient(ellipse 90% 60% at 20% -15%, rgba(190, 24, 93, 0.38), transparent 60%),
        radial-gradient(ellipse 70% 55% at 88% 0%, rgba(21, 128, 61, 0.32), transparent 60%),
        linear-gradient(180deg, #10060f 0%, #150d1a 55%, #05060a 100%)`,
    },
    nebulas: ['rgba(244,114,182,0.45)', 'rgba(134,239,172,0.4)', 'rgba(251,207,232,0.42)'],
    particles: {
      shape: 'petal',
      motion: 'spin-fall',
      count: 26,
      size: [5, 11],
      aspect: 0.62,
      duration: [11, 22],
      colors: {
        light: ['#f9a8d4', '#fbcfe8', '#fda4af'],
        dark: ['#f9a8d4', '#fecdd3', '#fb7185'],
      },
    },
    stars: true,
    meteors: false,
  },
  {
    id: 'summer',
    label: 'Mùa Hạ',
    period: { kind: 'fixed', from: [5, 1], to: [7, 31] },
    sky: {
      light: `radial-gradient(ellipse 70% 55% at 82% -12%, rgba(253, 224, 71, 0.3), transparent 62%),
        radial-gradient(ellipse 85% 60% at 10% 8%, rgba(56, 189, 248, 0.2), transparent 60%),
        linear-gradient(180deg, #eefaff 0%, #f7fdff 50%, #fffdf5 100%)`,
      dark: `radial-gradient(ellipse 80% 55% at 80% -12%, rgba(217, 119, 6, 0.3), transparent 62%),
        radial-gradient(ellipse 95% 65% at 12% 5%, rgba(14, 116, 144, 0.45), transparent 60%),
        radial-gradient(ellipse 60% 50% at 50% 112%, rgba(13, 148, 136, 0.3), transparent 60%),
        linear-gradient(180deg, #04121a 0%, #06182a 55%, #020a12 100%)`,
    },
    nebulas: ['rgba(56,189,248,0.5)', 'rgba(45,212,191,0.45)', 'rgba(253,224,71,0.35)'],
    // Mặt trời chếch góc phải trên.
    orb: {
      light: 'rgba(253, 224, 71, 0.55)',
      dark: 'rgba(251, 146, 60, 0.42)',
      left: '78%',
      top: '-12%',
      size: '34vw',
    },
    // Đom đóm / bụi nắng bay lơ lửng.
    particles: {
      shape: 'glow',
      motion: 'drift',
      count: 30,
      size: [2, 5],
      duration: [12, 26],
      colors: {
        light: ['rgba(56,189,248,0.6)', 'rgba(45,212,191,0.55)', 'rgba(250,204,21,0.6)'],
        dark: ['#fde68a', '#fbbf24', '#a7f3d0'],
      },
    },
    stars: true,
    meteors: true,
  },
  {
    id: 'autumn',
    label: 'Mùa Thu',
    period: { kind: 'fixed', from: [8, 1], to: [10, 31] },
    sky: {
      light: `radial-gradient(ellipse 80% 60% at 15% -10%, rgba(251, 146, 60, 0.2), transparent 60%),
        radial-gradient(ellipse 70% 50% at 90% 5%, rgba(217, 119, 6, 0.14), transparent 60%),
        linear-gradient(180deg, #fff8ef 0%, #fffbf4 55%, #ffffff 100%)`,
      dark: `radial-gradient(ellipse 90% 60% at 20% -15%, rgba(154, 52, 18, 0.42), transparent 60%),
        radial-gradient(ellipse 70% 55% at 88% 0%, rgba(180, 83, 9, 0.34), transparent 60%),
        linear-gradient(180deg, #150b04 0%, #1a1008 55%, #08040a 100%)`,
    },
    nebulas: ['rgba(251,146,60,0.45)', 'rgba(245,158,11,0.42)', 'rgba(220,38,38,0.3)'],
    particles: {
      shape: 'leaf',
      motion: 'spin-fall',
      count: 24,
      size: [6, 13],
      aspect: 0.6,
      duration: [10, 20],
      colors: {
        light: ['#fb923c', '#f59e0b', '#d97706'],
        dark: ['#fdba74', '#fbbf24', '#f97316'],
      },
    },
    stars: true,
    meteors: false,
  },
  {
    id: 'winter',
    label: 'Mùa Đông',
    period: { kind: 'fixed', from: [11, 1], to: [1, 31] },
    sky: {
      light: `radial-gradient(ellipse 80% 60% at 15% -10%, rgba(147, 197, 253, 0.22), transparent 60%),
        radial-gradient(ellipse 70% 50% at 90% 5%, rgba(199, 210, 254, 0.18), transparent 60%),
        linear-gradient(180deg, #f2f7ff 0%, #f9fbff 55%, #ffffff 100%)`,
      dark: `radial-gradient(ellipse 90% 60% at 20% -15%, rgba(56, 78, 183, 0.5), transparent 60%),
        radial-gradient(ellipse 70% 55% at 88% 0%, rgba(126, 34, 206, 0.38), transparent 60%),
        radial-gradient(ellipse 60% 50% at 50% 110%, rgba(14, 116, 144, 0.28), transparent 60%),
        linear-gradient(180deg, #060a18 0%, #0a1026 55%, #04060f 100%)`,
    },
    nebulas: ['rgba(99,102,241,0.55)', 'rgba(56,189,248,0.42)', 'rgba(165,180,252,0.4)'],
    particles: {
      shape: 'round',
      motion: 'fall',
      count: 34,
      size: [2, 5],
      duration: [9, 20],
      colors: {
        light: ['rgba(99,102,241,0.4)', 'rgba(148,163,184,0.5)'],
        dark: ['rgba(255,255,255,0.85)', 'rgba(224,242,254,0.75)'],
      },
    },
    stars: true,
    meteors: true,
  },
];

/**
 * `'auto'` = chọn theme theo ngày hiện tại (hành vi mong muốn).
 * Đặt thẳng một id để ép cứng — tiện khi cần xem trước một dịp chưa tới.
 */
export const SEASONAL_THEME_OVERRIDE: SeasonalThemeId | 'auto' = 'auto';

/** Dùng khi không khoảng nào khớp (về lý thuyết không xảy ra vì 4 mùa phủ kín năm). */
export const FALLBACK_SEASONAL_THEME_ID: SeasonalThemeId = 'winter';

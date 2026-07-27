export type DashboardMemberStatDto = {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  /** Total overtime hours inside the queried range. */
  hours: number;
  /** Number of overtime records inside the range. */
  entries: number;
  /** Distinct days the member registered overtime on. */
  days: number;
};

export type DashboardDailyPointDto = {
  /** YYYY-MM-DD */
  date: string;
  hours: number;
  entries: number;
};

export type DashboardResponseDto = {
  range: { from: string; to: string };
  /** Everyone in the company, whether or not they registered overtime. */
  totalMembers: number;
  /** Members with at least one overtime record inside the range. */
  activeMembers: number;
  totalHours: number;
  totalEntries: number;
  avgHoursPerActiveMember: number;
  busiestDay: DashboardDailyPointDto | null;
  /** Company-wide totals across all time, for context next to the range totals. */
  allTimeHours: number;
  allTimeEntries: number;
  /** Every active member, ranked by hours descending — the OT leaderboard. */
  topMembers: DashboardMemberStatDto[];
  /** Per-day totals inside the range, ascending. Days without overtime are omitted. */
  daily: DashboardDailyPointDto[];
};

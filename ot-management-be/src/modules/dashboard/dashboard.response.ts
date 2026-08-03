/**
 * A member's overtime that has already been worked. Every total here stops at
 * yesterday: registrations for today or later are plans, not hours put in.
 */
export type DashboardMemberStatDto = {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  /** Total overtime hours worked inside the queried range. */
  hours: number;
  /** Number of overtime records inside the range. */
  entries: number;
  /** Distinct days the member worked overtime on. */
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
  /** Members with at least one overtime record inside the range, upcoming included. */
  activeMembers: number;
  totalHours: number;
  totalEntries: number;
  avgHoursPerActiveMember: number;
  busiestDay: DashboardDailyPointDto | null;
  /** Company-wide totals across all time, for context next to the range totals. */
  allTimeHours: number;
  allTimeEntries: number;
  /**
   * The OT leaderboard, ranked by hours descending and un-truncated. Counts only
   * overtime up to yesterday, so a member whose overtime in this range is still
   * upcoming is absent here even though they count towards `activeMembers`.
   */
  topMembers: DashboardMemberStatDto[];
  /** Per-day totals inside the range, ascending. Days without overtime are omitted. */
  daily: DashboardDailyPointDto[];
};

/**
 * A member's overtime for the queried range, split into what has actually been
 * worked and what the range holds in total.
 *
 * The un-prefixed fields stop at yesterday — a registration for today or later
 * is a plan, not hours put in — while the `total*` fields cover the whole range,
 * upcoming days included. The pair lets the client draw progress-so-far against
 * the full commitment.
 */
export type DashboardMemberStatDto = {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  /** Overtime hours worked so far — up to and including yesterday. */
  hours: number;
  /** Number of overtime records already worked. */
  entries: number;
  /** Distinct days the member has worked overtime on. */
  days: number;
  /** Overtime hours registered across the whole range, upcoming days included. */
  totalHours: number;
  /** Number of overtime records across the whole range. */
  totalEntries: number;
  /** Distinct days the member registered overtime on across the whole range. */
  totalDays: number;
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
   * The OT leaderboard: every member with overtime in the range, un-truncated,
   * ranked by hours *worked* descending. A member whose overtime is still
   * upcoming is present with `hours: 0` and a non-zero `totalHours`.
   */
  topMembers: DashboardMemberStatDto[];
  /** Per-day totals inside the range, ascending. Days without overtime are omitted. */
  daily: DashboardDailyPointDto[];
};

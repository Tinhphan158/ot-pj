/**
 * A member's overtime for the period, split into what has been worked and what
 * the period holds in total.
 *
 * The un-prefixed fields stop at yesterday — overtime registered for today or
 * later has not happened yet — while `total*` covers the whole period. The pair
 * is what the leaderboard's two bars are drawn from.
 */
export interface DashboardMemberStat {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  /** Hours worked so far — up to and including yesterday. */
  hours: number;
  entries: number;
  /** Distinct days the member has worked overtime on. */
  days: number;
  /** Hours registered across the whole period, upcoming days included. */
  totalHours: number;
  totalEntries: number;
  totalDays: number;
}

export interface DashboardDailyPoint {
  /** YYYY-MM-DD */
  date: string;
  hours: number;
  entries: number;
}

export interface DashboardStats {
  range: { from: string; to: string };
  totalMembers: number;
  activeMembers: number;
  totalHours: number;
  totalEntries: number;
  avgHoursPerActiveMember: number;
  busiestDay: DashboardDailyPoint | null;
  allTimeHours: number;
  allTimeEntries: number;
  /** Every member with overtime in the period, ranked by hours *worked* descending. */
  topMembers: DashboardMemberStat[];
  /** Per-day totals inside the range, ascending. Days without overtime are omitted. */
  daily: DashboardDailyPoint[];
}

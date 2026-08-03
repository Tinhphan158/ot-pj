/**
 * A member's overtime that has already been worked — every total stops at
 * yesterday, so overtime registered for today or later is not in here.
 */
export interface DashboardMemberStat {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  hours: number;
  entries: number;
  /** Distinct days the member worked overtime on. */
  days: number;
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
  /** Members ranked by hours descending — worked overtime only, upcoming excluded. */
  topMembers: DashboardMemberStat[];
  /** Per-day totals inside the range, ascending. Days without overtime are omitted. */
  daily: DashboardDailyPoint[];
}

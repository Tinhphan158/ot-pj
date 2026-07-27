export interface DashboardMemberStat {
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  hours: number;
  entries: number;
  /** Distinct days the member registered overtime on. */
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
  /** Active members ranked by hours descending. */
  topMembers: DashboardMemberStat[];
  /** Per-day totals inside the range, ascending. Days without overtime are omitted. */
  daily: DashboardDailyPoint[];
}

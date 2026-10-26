export interface OvertimeUserSummary {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface Overtime {
  id: string;
  userId: string;
  user: OvertimeUserSummary | null;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  createdAt: string;
  updatedAt: string;
}

export type OvertimeDayType = 'weekday' | 'weekend' | 'holiday';

export interface OvertimeWindow {
  /** "HH:mm" */
  start: string;
  /** "HH:mm" */
  end: string;
}

/** The server's overtime rules — the client validates and draws with exactly these. */
export interface OvertimeRules {
  limits: { monthlyHours: number; yearlyHours: number };
  windows: { weekday: OvertimeWindow; dayOff: OvertimeWindow };
  multipliers: Record<OvertimeDayType, number>;
  /** Public holidays, ascending. */
  holidays: { date: string; name: string }[];
  /** Days after an OT month cycle ends (the 20th) during which it can still be changed. */
  lockGraceDays: number;
}

export interface OvertimeUsagePeriod {
  /** Inclusive start, YYYY-MM-DD. */
  from: string;
  /** Exclusive end, YYYY-MM-DD. */
  to: string;
  limit: number;
  /** Everything registered in the period, upcoming days included — what the cap is checked against. */
  registered: number;
  /** Hours worked so far — up to and including yesterday. */
  worked: number;
}

/** The signed-in user's standing against the monthly and yearly caps. */
export interface OvertimeUsage {
  monthly: OvertimeUsagePeriod;
  yearly: OvertimeUsagePeriod;
}

export type OvertimeAuditAction = 'CREATED' | 'UPDATED' | 'DELETED';

export interface OvertimeSnapshot {
  userId: string;
  userName: string | null;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
}

export interface OvertimeAuditLog {
  id: string;
  overtimeId: string;
  action: OvertimeAuditAction;
  actor: OvertimeUserSummary | null;
  /** Null on CREATED. */
  before: OvertimeSnapshot | null;
  /** Null on DELETED. */
  after: OvertimeSnapshot | null;
  createdAt: string;
}

export interface OvertimeAuditPage {
  items: OvertimeAuditLog[];
  nextCursor: string | null;
}

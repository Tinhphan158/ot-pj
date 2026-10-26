import type { OvertimeAuditAction } from '@prisma/client';
import type { OvertimeDayType, OvertimeWindow } from '@/utils';
import type { OvertimeSnapshot } from './overtime.entity';

export type OvertimeUserSummary = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

export type OvertimeResponseDto = {
  id: string;
  userId: string;
  user: OvertimeUserSummary | null;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  createdAt: Date;
  updatedAt: Date;
};

/** Every rule the client needs to validate and draw overtime the way the server does. */
export type OvertimeRulesResponseDto = {
  limits: { monthlyHours: number; yearlyHours: number };
  windows: { weekday: OvertimeWindow; dayOff: OvertimeWindow };
  multipliers: Record<OvertimeDayType, number>;
  /** Public holidays, ascending. */
  holidays: { date: string; name: string }[];
  /** Days after an OT month cycle ends during which it can still be changed. */
  lockGraceDays: number;
};

export type OvertimeUsagePeriodDto = {
  /** Inclusive start date (YYYY-MM-DD). */
  from: string;
  /** Exclusive end date (YYYY-MM-DD). */
  to: string;
  limit: number;
  /** Hours registered across the whole period, upcoming days included — what the cap is checked against. */
  registered: number;
  /** Hours worked so far — up to and including yesterday. */
  worked: number;
};

/** The signed-in user's standing against the monthly and yearly caps. */
export type OvertimeUsageResponseDto = {
  monthly: OvertimeUsagePeriodDto;
  yearly: OvertimeUsagePeriodDto;
};

export type OvertimeAuditLogResponseDto = {
  id: string;
  overtimeId: string;
  action: OvertimeAuditAction;
  actor: OvertimeUserSummary | null;
  before: OvertimeSnapshot | null;
  after: OvertimeSnapshot | null;
  createdAt: Date;
};

export type OvertimeAuditPageResponseDto = {
  items: OvertimeAuditLogResponseDto[];
  /** Pass back as `cursor` for the next page; null on the last page. */
  nextCursor: string | null;
};

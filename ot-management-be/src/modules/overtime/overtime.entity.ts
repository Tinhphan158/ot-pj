import { Prisma } from '@prisma/client';

export const overtimeWithUserInclude = {
  user: {
    select: { id: true, name: true, email: true, avatar: true },
  },
} as const satisfies Prisma.OvertimeInclude;

export type OvertimeEntity = Prisma.OvertimeGetPayload<{ include: typeof overtimeWithUserInclude }>;

export const overtimeAuditLogInclude = {
  actor: {
    select: { id: true, name: true, email: true, avatar: true },
  },
} as const satisfies Prisma.OvertimeAuditLogInclude;

export type OvertimeAuditLogEntity = Prisma.OvertimeAuditLogGetPayload<{ include: typeof overtimeAuditLogInclude }>;

/** The shape stored in an audit log's `before` / `after` columns. */
export type OvertimeSnapshot = {
  userId: string;
  userName: string | null;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
};

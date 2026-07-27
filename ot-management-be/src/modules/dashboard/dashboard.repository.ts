import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '@/database/database.service';

export type OvertimeTotals = {
  hours: number;
  entries: number;
};

/** One (member, day) bucket — the finest grain the dashboard needs. */
export type OvertimeMemberDayGroup = {
  userId: string;
  date: Date;
  hours: number;
  entries: number;
};

export type DashboardMemberSummary = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

@Injectable()
export class DashboardRepository {
  constructor(private readonly db: DatabaseService) {}

  countMembers(): Promise<number> {
    return this.db.user.count();
  }

  async sumOvertime(where: Prisma.OvertimeWhereInput): Promise<OvertimeTotals> {
    const result = await this.db.overtime.aggregate({
      where,
      _sum: { hours: true },
      _count: { _all: true },
    });
    return { hours: result._sum.hours ?? 0, entries: result._count._all };
  }

  /**
   * Group overtime by member AND day in a single query — the service folds these
   * buckets into both the member leaderboard and the daily trend.
   */
  async groupByMemberAndDay(where: Prisma.OvertimeWhereInput): Promise<OvertimeMemberDayGroup[]> {
    const rows = await this.db.overtime.groupBy({
      by: ['userId', 'date'],
      where,
      _sum: { hours: true },
      _count: { _all: true },
    });
    return rows.map((row) => ({
      userId: row.userId,
      date: row.date,
      hours: row._sum.hours ?? 0,
      entries: row._count._all,
    }));
  }

  findMembersByIds(ids: string[]): Promise<DashboardMemberSummary[]> {
    return this.db.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, email: true, avatar: true },
    });
  }
}

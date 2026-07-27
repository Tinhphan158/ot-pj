import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { roundHours } from '@/utils';
import { DashboardRepository } from './dashboard.repository';
import { QueryDashboardDto } from './dto';
import { DashboardDailyPointDto, DashboardMemberStatDto, DashboardResponseDto } from './dashboard.response';

type MemberAccumulator = { hours: number; entries: number; days: number };

/** Format a Date as a YYYY-MM-DD string (date-only field). */
function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  /**
   * Company-wide overtime statistics for [from, to). The caller owns the period
   * maths (week / OT month cycle / year), so the same endpoint serves every tab.
   */
  async getStats(query: QueryDashboardDto): Promise<DashboardResponseDto> {
    const where: Prisma.OvertimeWhereInput = {
      date: { gte: new Date(query.from), lt: new Date(query.to) },
    };

    const [totalMembers, rangeTotals, allTimeTotals, groups] = await Promise.all([
      this.dashboardRepository.countMembers(),
      this.dashboardRepository.sumOvertime(where),
      this.dashboardRepository.sumOvertime({}),
      this.dashboardRepository.groupByMemberAndDay(where),
    ]);

    const byMember = new Map<string, MemberAccumulator>();
    const byDay = new Map<string, DashboardDailyPointDto>();

    for (const group of groups) {
      const member = byMember.get(group.userId) ?? { hours: 0, entries: 0, days: 0 };
      member.hours += group.hours;
      member.entries += group.entries;
      member.days += 1;
      byMember.set(group.userId, member);

      const date = toDateString(group.date);
      const day = byDay.get(date) ?? { date, hours: 0, entries: 0 };
      day.hours += group.hours;
      day.entries += group.entries;
      byDay.set(date, day);
    }

    const members = byMember.size
      ? await this.dashboardRepository.findMembersByIds([...byMember.keys()])
      : [];
    const memberById = new Map(members.map((member) => [member.id, member]));

    const topMembers: DashboardMemberStatDto[] = [...byMember.entries()]
      .map(([userId, stats]) => {
        const member = memberById.get(userId);
        return {
          userId,
          name: member?.name ?? 'Unknown',
          email: member?.email ?? '',
          avatar: member?.avatar ?? null,
          hours: roundHours(stats.hours),
          entries: stats.entries,
          days: stats.days,
        };
      })
      .sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name));

    const daily = [...byDay.values()]
      .map((day) => ({ ...day, hours: roundHours(day.hours) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const busiestDay = daily.reduce<DashboardDailyPointDto | null>(
      (best, day) => (best === null || day.hours > best.hours ? day : best),
      null,
    );

    const activeMembers = byMember.size;

    return {
      range: { from: query.from, to: query.to },
      totalMembers,
      activeMembers,
      totalHours: roundHours(rangeTotals.hours),
      totalEntries: rangeTotals.entries,
      avgHoursPerActiveMember: activeMembers > 0 ? roundHours(rangeTotals.hours / activeMembers) : 0,
      busiestDay,
      allTimeHours: roundHours(allTimeTotals.hours),
      allTimeEntries: allTimeTotals.entries,
      topMembers,
      daily,
    };
  }
}

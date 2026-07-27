'use client';

import { CalendarClock, Clock, TrendingUp, Users } from 'lucide-react';
import type { DashboardStats as DashboardStatsData } from '@/shared/api';
import { AppStatCard } from '@/shared/components/custome';
import { formatDate, formatHours } from '@/shared/utils/format';

interface DashboardStatsProps {
  stats: DashboardStatsData;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const busiestDayHint = stats.busiestDay
    ? `Nhiều nhất: ${formatDate(stats.busiestDay.date)} (${formatHours(stats.busiestDay.hours)})`
    : 'Chưa có đơn OT nào trong kỳ';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AppStatCard
        label="Thành viên"
        value={stats.totalMembers}
        hint={`${stats.activeMembers} người có OT trong kỳ`}
        icon={Users}
      />
      <AppStatCard
        label="Tổng giờ OT"
        value={formatHours(stats.totalHours)}
        hint={`Toàn thời gian: ${formatHours(stats.allTimeHours)}`}
        icon={Clock}
        accentClassName="bg-chart-2/15 text-chart-2"
      />
      <AppStatCard
        label="Số đơn OT"
        value={stats.totalEntries}
        hint={busiestDayHint}
        icon={CalendarClock}
        accentClassName="bg-chart-3/15 text-chart-3"
      />
      <AppStatCard
        label="Trung bình / người"
        value={formatHours(stats.avgHoursPerActiveMember)}
        hint={stats.activeMembers > 0 ? `Tính trên ${stats.activeMembers} người có OT` : 'Chưa có dữ liệu'}
        icon={TrendingUp}
        accentClassName="bg-chart-4/15 text-chart-4"
      />
    </div>
  );
}

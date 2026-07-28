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
    ? `Busiest: ${formatDate(stats.busiestDay.date)} (${formatHours(stats.busiestDay.hours)})`
    : 'No overtime entries in this period';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AppStatCard
        label="Members"
        value={stats.totalMembers}
        hint={`${stats.activeMembers} with overtime in the period`}
        icon={Users}
      />
      <AppStatCard
        label="Total OT hours"
        value={formatHours(stats.totalHours)}
        hint={`All time: ${formatHours(stats.allTimeHours)}`}
        icon={Clock}
        accentClassName="bg-chart-2/15 text-chart-2"
      />
      <AppStatCard
        label="OT entries"
        value={stats.totalEntries}
        hint={busiestDayHint}
        icon={CalendarClock}
        accentClassName="bg-chart-3/15 text-chart-3"
      />
      <AppStatCard
        label="Average / person"
        value={formatHours(stats.avgHoursPerActiveMember)}
        hint={stats.activeMembers > 0 ? `Across ${stats.activeMembers} people with overtime` : 'No data yet'}
        icon={TrendingUp}
        accentClassName="bg-chart-4/15 text-chart-4"
      />
    </div>
  );
}

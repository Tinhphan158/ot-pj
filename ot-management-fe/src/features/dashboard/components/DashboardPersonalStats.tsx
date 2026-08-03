'use client';

import { CalendarCheck, Clock, Medal, PieChart } from 'lucide-react';
import type { DashboardStats as DashboardStatsData } from '@/shared/api';
import { AppStatCard } from '@/shared/components/custome';
import { formatHours } from '@/shared/utils/format';

interface DashboardPersonalStatsProps {
  stats: DashboardStatsData;
  currentUserId?: string;
}

/**
 * The signed-in user's own numbers for the selected period.
 *
 * Derived from `topMembers`, which the API returns un-truncated — every member
 * with overtime in the range is in there — so this needs no extra request. A
 * user with no overtime yet still gets the row, filled with zeros, rather than
 * having the section vanish.
 *
 * These cards report overtime *worked*, so the company figures they compare
 * against are summed from that same list rather than taken from the range-wide
 * `totalHours` / `activeMembers`, which include overtime still to come.
 */
export function DashboardPersonalStats({ stats, currentUserId }: DashboardPersonalStatsProps) {
  const rankIndex = currentUserId
    ? stats.topMembers.findIndex((member) => member.userId === currentUserId)
    : -1;
  const me = rankIndex >= 0 ? stats.topMembers[rankIndex] : null;

  const hours = me?.hours ?? 0;
  const entries = me?.entries ?? 0;
  const days = me?.days ?? 0;

  const rankedMembers = stats.topMembers.length;
  const companyHours = stats.topMembers.reduce((total, member) => total + member.hours, 0);
  const sharePercent = companyHours > 0 ? Math.round((hours / companyHours) * 100) : 0;
  const avgPerDay = days > 0 ? hours / days : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AppStatCard
        label="My OT hours"
        value={formatHours(hours)}
        hint={
          // The board keeps members whose overtime is all still ahead of them, so
          // being on it is not the same as having worked any of it.
          hours > 0
            ? `Ranked #${rankIndex + 1} of ${rankedMembers} with overtime`
            : 'You have no overtime worked in this period'
        }
        icon={Clock}
      />
      <AppStatCard
        label="My OT entries"
        value={entries}
        hint={days > 0 ? `Across ${days} ${days === 1 ? 'day' : 'days'}` : 'No days logged yet'}
        icon={CalendarCheck}
        accentClassName="bg-chart-2/15 text-chart-2"
      />
      <AppStatCard
        label="My average / day"
        value={formatHours(avgPerDay)}
        hint={days > 0 ? 'Counting only the days you logged overtime' : 'No data yet'}
        icon={Medal}
        accentClassName="bg-chart-3/15 text-chart-3"
      />
      <AppStatCard
        label="My share of company OT"
        value={`${sharePercent}%`}
        hint={`Of ${formatHours(companyHours)} worked company-wide`}
        icon={PieChart}
        accentClassName="bg-chart-4/15 text-chart-4"
      />
    </div>
  );
}

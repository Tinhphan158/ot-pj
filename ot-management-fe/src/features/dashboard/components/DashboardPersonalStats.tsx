'use client';

import { CalendarCheck, Clock, Hourglass, Medal, PieChart } from 'lucide-react';
import type { DashboardStats as DashboardStatsData } from '@/shared/api';
import { AppStatCard } from '@/shared/components/custome';
import { cn } from '@/shared/utils/cn';
import { formatHours } from '@/shared/utils/format';
import type { DashboardPeriod } from '@/features/dashboard/utils/trend';

interface DashboardPersonalStatsProps {
  stats: DashboardStatsData;
  period: DashboardPeriod;
  /** The member whose numbers are shown — the signed-in user unless the dashboard is filtered. */
  subjectId?: string;
  /** Whether `subjectId` is the signed-in user, which only changes the wording. */
  isSelf: boolean;
}

/**
 * One member's numbers for the selected period — the signed-in user's own, or
 * whoever the dashboard is filtered to.
 *
 * Derived from `topMembers`, which the API returns un-truncated — every member
 * with overtime in the range is in there — so this needs no extra request. A
 * user with no overtime yet still gets the row, filled with zeros, rather than
 * having the section vanish.
 *
 * These cards report overtime *worked* (up to yesterday), and so does the
 * company total they compare against, summed from that same list.
 */
export function DashboardPersonalStats({ stats, period, subjectId, isSelf }: DashboardPersonalStatsProps) {
  const rankIndex = subjectId ? stats.topMembers.findIndex((member) => member.userId === subjectId) : -1;
  const me = rankIndex >= 0 ? stats.topMembers[rankIndex] : null;

  const hours = me?.hours ?? 0;
  const entries = me?.entries ?? 0;
  const days = me?.days ?? 0;
  const upcomingHours = (me?.totalHours ?? 0) - hours;

  const rankedMembers = stats.topMembers.length;
  const companyHours = stats.topMembers.reduce((total, member) => total + member.hours, 0);
  const sharePercent = companyHours > 0 ? Math.round((hours / companyHours) * 100) : 0;
  const avgPerDay = days > 0 ? hours / days : 0;

  // The caps are per OT month cycle and per OT year, which is exactly what the
  // month and year ranges cover — a week has no cap of its own.
  const limit =
    period === 'month' ? stats.limits.monthlyHours : period === 'year' ? stats.limits.yearlyHours : null;
  const remaining = limit !== null ? Math.max(0, limit - hours) : 0;

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', limit !== null ? 'xl:grid-cols-5' : 'xl:grid-cols-4')}>
      <AppStatCard
        label={isSelf ? 'My OT hours' : 'OT hours'}
        value={formatHours(hours)}
        hint={
          // The board keeps members whose overtime is all still ahead of them, so
          // being on it is not the same as having worked any of it.
          hours > 0
            ? `Ranked #${rankIndex + 1} of ${rankedMembers} with overtime`
            : `${isSelf ? 'You have' : 'This member has'} no overtime worked in this period`
        }
        icon={Clock}
      />
      <AppStatCard
        label={isSelf ? 'My OT entries' : 'OT entries'}
        value={entries}
        hint={days > 0 ? `Across ${days} ${days === 1 ? 'day' : 'days'}` : 'No days logged yet'}
        icon={CalendarCheck}
        accentClassName="bg-chart-2/15 text-chart-2"
      />
      <AppStatCard
        label={isSelf ? 'My average / day' : 'Average / day'}
        value={formatHours(avgPerDay)}
        hint={days > 0 ? 'Counting only days with overtime logged' : 'No data yet'}
        icon={Medal}
        accentClassName="bg-chart-3/15 text-chart-3"
      />
      <AppStatCard
        label={isSelf ? 'My share of company OT' : 'Share of company OT'}
        value={`${sharePercent}%`}
        hint={`Of ${formatHours(companyHours)} worked company-wide`}
        icon={PieChart}
        accentClassName="bg-chart-4/15 text-chart-4"
      />
      {limit !== null && (
        <AppStatCard
          label="OT hours remaining"
          value={formatHours(remaining)}
          hint={
            hours > limit
              ? `Over the ${limit}h ${period}ly limit by ${formatHours(hours - limit)}`
              : upcomingHours > 0
                ? `Of ${limit}h · ${formatHours(upcomingHours)} more booked ahead`
                : `Of the ${limit}h ${period}ly limit`
          }
          icon={Hourglass}
          accentClassName={remaining > 0 ? undefined : 'bg-destructive/15 text-destructive'}
        />
      )}
    </div>
  );
}

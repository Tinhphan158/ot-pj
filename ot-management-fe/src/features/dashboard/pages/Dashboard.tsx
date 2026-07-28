'use client';

import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppPageContainer } from '@/shared/components/custome';
import { cn } from '@/shared/utils/cn';
import { useCurrentUser } from '@/features/auth/store/auth.store';
import { getRange, shiftAnchor } from '@/features/overtime/utils/period';
import { useOvertimeRealtime } from '@/features/overtime/hooks/useOvertimeRealtime';
import { useDashboardQuery } from '@/features/dashboard/hooks/queries/useDashboardQuery';
import { buildTrend, type DashboardPeriod } from '@/features/dashboard/utils/trend';
import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardPersonalStats } from '@/features/dashboard/components/DashboardPersonalStats';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { DashboardTrendChart } from '@/features/dashboard/components/DashboardTrendChart';
import { DashboardTopMembers } from '@/features/dashboard/components/DashboardTopMembers';

const TREND_COPY: Record<DashboardPeriod, { title: string; description: string }> = {
  week: { title: 'OT hours by day', description: 'Company-wide OT hours for each day of the week.' },
  month: { title: 'OT hours by day', description: 'OT hours for each day of the cycle (21st of last month → 20th of this month).' },
  year: { title: 'OT hours by month', description: 'OT hours for each monthly cycle of the year.' },
};

export default function Dashboard() {
  const currentUser = useCurrentUser();
  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const [anchor, setAnchor] = useState(() => new Date());

  // Realtime: any create/update/delete by anyone refreshes these numbers.
  useOvertimeRealtime();

  const { from, to } = useMemo(() => getRange(period, anchor), [period, anchor]);
  const query = useDashboardQuery(from, to);
  const stats = query.data;

  const trend = useMemo(() => buildTrend(period, anchor, stats?.daily ?? []), [period, anchor, stats?.daily]);

  return (
    <AppPageContainer>
      <DashboardHeader
        period={period}
        anchor={anchor}
        onPeriodChange={setPeriod}
        onShift={(delta) => setAnchor((prev) => shiftAnchor(period, prev, delta))}
        onToday={() => setAnchor(new Date())}
      />

      {query.isLoading || !stats ? (
        <div className="animate-in fade-in flex min-h-[320px] items-center justify-center rounded-xl border bg-card duration-300">
          {query.isError ? (
            <span className="text-sm text-destructive">Could not load the statistics.</span>
          ) : (
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          )}
        </div>
      ) : (
        // The query keeps the previous data while refetching, so switching period
        // never unmounts this. Dimming it instead is the fade-out, and the
        // fade-back-in lands when the new numbers arrive.
        <div
          className={cn(
            'flex flex-col gap-5 transition-opacity duration-300 ease-out',
            query.isFetching ? 'opacity-50' : 'opacity-100',
          )}
        >
          <section className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-2 duration-500 ease-out">
            <h2 className="text-sm font-medium text-muted-foreground">Your overtime</h2>
            <DashboardPersonalStats stats={stats} currentUserId={currentUser?.id} />
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-2 delay-75 duration-500 ease-out">
            <h2 className="text-sm font-medium text-muted-foreground">Company-wide</h2>
            <DashboardStats stats={stats} />
          </section>

          <div className="animate-in fade-in slide-in-from-bottom-2 grid grid-cols-1 gap-4 delay-150 duration-500 ease-out lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DashboardTrendChart
                title={TREND_COPY[period].title}
                description={TREND_COPY[period].description}
                data={trend}
              />
            </div>
            <DashboardTopMembers members={stats.topMembers} currentUserId={currentUser?.id} />
          </div>
        </div>
      )}
    </AppPageContainer>
  );
}

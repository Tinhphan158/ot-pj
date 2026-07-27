'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import { AppDatePicker, AppPageContainer, AppPageHeader } from '@/shared/components/custome';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { formatDate, formatDateWithWeekday } from '@/shared/utils/format';
import { useCurrentUser } from '@/features/auth/store/auth.store';
import { useOvertimeRangeQuery } from '@/features/overtime/hooks/queries/useOvertimesQuery';
import { useOvertimeActions } from '@/features/overtime/hooks/useOvertimeActions';
import { useOvertimeRealtime } from '@/features/overtime/hooks/useOvertimeRealtime';
import {
  addDays,
  getRange,
  monthCycle,
  parseDateStr,
  shiftAnchor,
  startOfWeek,
  toDateStr,
  type OvertimeView,
} from '@/features/overtime/utils/period';
import { OvertimeDayTimeline } from '@/features/overtime/components/OvertimeDayTimeline';
import { OvertimeWeekView } from '@/features/overtime/components/OvertimeWeekView';
import { OvertimeMonthView } from '@/features/overtime/components/OvertimeMonthView';
import { OvertimeYearView } from '@/features/overtime/components/OvertimeYearView';
import { OvertimeDrawer } from '@/features/overtime/components/dialog/OvertimeDrawer';
import { OvertimeCrowdedDayDialog } from '@/features/overtime/components/dialog/OvertimeCrowdedDayDialog';

const VIEW_OPTIONS: { value: OvertimeView; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

function periodLabel(view: OvertimeView, anchor: Date): string {
  switch (view) {
    case 'day':
      return formatDateWithWeekday(anchor);
    case 'week': {
      const start = startOfWeek(anchor);
      const end = addDays(start, 6);
      return `${formatDate(start, 'dd/MM')} – ${formatDate(end, 'dd/MM/yyyy')}`;
    }
    case 'month': {
      const { start, endExclusive, labelMonth } = monthCycle(anchor);
      const end = addDays(endExclusive, -1);
      return `Tháng ${labelMonth + 1}: ${formatDate(start, 'dd/MM')} – ${formatDate(end, 'dd/MM/yyyy')}`;
    }
    case 'year':
      return `Năm ${anchor.getFullYear()}`;
  }
}

export default function TeamOvertime() {
  const currentUser = useCurrentUser();
  const [view, setView] = useState<OvertimeView>('day');
  const [anchor, setAnchor] = useState(() => new Date());

  // Realtime: refresh + notify when anyone creates/updates/deletes an OT.
  useOvertimeRealtime();

  const { from, to } = useMemo(() => getRange(view, anchor), [view, anchor]);
  const query = useOvertimeRangeQuery(from, to);
  const items = useMemo(() => query.data ?? [], [query.data]);
  const actions = useOvertimeActions();

  const goToDay = (date: string) => {
    setAnchor(parseDateStr(date));
    setView('day');
  };

  const goToMonth = (monthIndex: number) => {
    setAnchor(new Date(anchor.getFullYear(), monthIndex, 1));
    setView('month');
  };

  return (
    <AppPageContainer>
      <AppPageHeader
        title="Overtime management"
        description="See who is working overtime and during which time slots — pick a day, or browse by week, month or year."
        actions={
          <Button onClick={() => actions.openCreate(toDateStr(anchor))}>
            <Plus className="size-4" />
            Register overtime
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={view} onValueChange={(value) => setView(value as OvertimeView)}>
          <TabsList>
            {VIEW_OPTIONS.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setAnchor((prev) => shiftAnchor(view, prev, -1))}
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </Button>
            {view === 'day' ? (
              // In Day view the label becomes a date picker (dd/MM/yyyy).
              <AppDatePicker
                value={toDateStr(anchor)}
                onChange={(iso) => setAnchor(parseDateStr(iso))}
                className="h-8 min-w-[190px] justify-center font-medium"
              />
            ) : (
              <span className="min-w-[190px] text-center text-sm font-medium">{periodLabel(view, anchor)}</span>
            )}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setAnchor((prev) => shiftAnchor(view, prev, 1))}
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {query.isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border bg-card">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-destructive">
          Could not load overtime for this period.
        </div>
      ) : view === 'day' ? (
        <OvertimeDayTimeline overtimes={items} currentUserId={currentUser?.id} onSelect={actions.openEdit} />
      ) : view === 'week' ? (
        <OvertimeWeekView
          overtimes={items}
          weekStart={startOfWeek(anchor)}
          currentUserId={currentUser?.id}
          onSelectDay={goToDay}
          onSelect={actions.openEdit}
        />
      ) : view === 'month' ? (
        <OvertimeMonthView
          overtimes={items}
          monthAnchor={anchor}
          currentUserId={currentUser?.id}
          onSelectDay={goToDay}
        />
      ) : (
        <OvertimeYearView overtimes={items} currentUserId={currentUser?.id} onSelectMonth={goToMonth} />
      )}

      <OvertimeDrawer
        open={actions.drawerOpen}
        onOpenChange={actions.handleDrawerOpenChange}
        editing={actions.editing}
        defaultDate={actions.defaultDate}
        isSubmitting={actions.isSubmitting}
        onSubmit={actions.handleSubmit}
        onDelete={actions.handleDelete}
        isDeleting={actions.isDeleting}
      />

      <OvertimeCrowdedDayDialog
        day={actions.crowdedDay}
        onOpenChange={actions.handleCrowdedDayOpenChange}
        onConfirm={actions.handleCrowdedDayConfirm}
        isSubmitting={actions.isSubmitting}
      />
    </AppPageContainer>
  );
}

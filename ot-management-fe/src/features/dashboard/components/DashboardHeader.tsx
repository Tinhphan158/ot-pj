'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppPageHeader } from '@/shared/components/custome';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { DASHBOARD_PERIODS, periodLabel, type DashboardPeriod } from '@/features/dashboard/utils/trend';

interface DashboardHeaderProps {
  period: DashboardPeriod;
  anchor: Date;
  onPeriodChange: (period: DashboardPeriod) => void;
  onShift: (delta: number) => void;
  onToday: () => void;
}

export function DashboardHeader({ period, anchor, onPeriodChange, onShift, onToday }: DashboardHeaderProps) {
  return (
    <>
      <AppPageHeader
        title="Dashboard"
        description="Tổng quan OT của cả công ty — số thành viên, tổng giờ và bảng xếp hạng OT theo tuần, tháng hoặc năm."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={period} onValueChange={(value) => onPeriodChange(value as DashboardPeriod)}>
          <TabsList>
            {DASHBOARD_PERIODS.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToday}>
            Hôm nay
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-8" onClick={() => onShift(-1)} aria-label="Kỳ trước">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[220px] text-center text-sm font-medium">{periodLabel(period, anchor)}</span>
            <Button variant="outline" size="icon" className="size-8" onClick={() => onShift(1)} aria-label="Kỳ sau">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

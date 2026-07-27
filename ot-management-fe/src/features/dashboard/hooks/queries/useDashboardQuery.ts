'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { dashboardKeys, dashboardService } from '@/shared/api';

export function useDashboardQuery(from: string, to: string) {
  return useQuery({
    queryKey: dashboardKeys.stats(from, to),
    queryFn: () => dashboardService.getStats(from, to),
    enabled: Boolean(from && to),
    placeholderData: keepPreviousData,
  });
}

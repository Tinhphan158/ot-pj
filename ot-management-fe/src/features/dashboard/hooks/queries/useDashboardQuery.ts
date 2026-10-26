'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { dashboardKeys, dashboardService } from '@/shared/api';

/** `userId` narrows the trend to one member; the other figures stay company-wide. */
export function useDashboardQuery(from: string, to: string, userId?: string) {
  return useQuery({
    queryKey: dashboardKeys.stats(from, to, userId),
    queryFn: () => dashboardService.getStats(from, to, userId),
    enabled: Boolean(from && to),
    placeholderData: keepPreviousData,
  });
}

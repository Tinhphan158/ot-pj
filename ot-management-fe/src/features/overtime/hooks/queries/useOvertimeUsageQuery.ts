'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { overtimeKeys, overtimeService } from '@/shared/api';

/** The signed-in user's hours against the caps for the OT month / year containing `date`. */
export function useOvertimeUsageQuery(date: string | undefined) {
  return useQuery({
    queryKey: overtimeKeys.usage(date ?? ''),
    queryFn: () => overtimeService.getUsage(date!),
    enabled: Boolean(date),
    placeholderData: keepPreviousData,
  });
}

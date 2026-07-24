'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { overtimeKeys, overtimeService } from '@/shared/api';

export function useOvertimeRangeQuery(from: string, to: string) {
  return useQuery({
    queryKey: overtimeKeys.range(from, to),
    queryFn: () => overtimeService.findByRange(from, to),
    enabled: Boolean(from && to),
    placeholderData: keepPreviousData,
  });
}

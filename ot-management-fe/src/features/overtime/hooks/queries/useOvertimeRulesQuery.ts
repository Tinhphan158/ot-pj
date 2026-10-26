'use client';

import { useQuery } from '@tanstack/react-query';
import { overtimeKeys, overtimeService } from '@/shared/api';

/** The server's overtime rules. They only change with a deploy, so fetch once per session. */
export function useOvertimeRulesQuery() {
  return useQuery({
    queryKey: overtimeKeys.rules,
    queryFn: overtimeService.getRules,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

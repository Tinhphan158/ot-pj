'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { overtimeKeys, overtimeService } from '@/shared/api';

/** Change history, newest first, one page at a time. */
export function useOvertimeAuditLogsQuery(filters: { overtimeId?: string; actorId?: string } = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: overtimeKeys.auditLogs(filters),
    queryFn: ({ pageParam }) => overtimeService.findAuditLogs({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });
}

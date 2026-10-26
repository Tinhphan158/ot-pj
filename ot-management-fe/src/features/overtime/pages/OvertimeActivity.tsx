'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppPageContainer, AppPageHeader } from '@/shared/components/custome';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useCurrentUser } from '@/features/auth/store/auth.store';
import { useOvertimeRealtime } from '@/features/overtime/hooks/useOvertimeRealtime';
import { useOvertimeAuditLogsQuery } from '@/features/overtime/hooks/queries/useOvertimeAuditLogsQuery';
import { OvertimeAuditItem } from '@/features/overtime/components/audit/OvertimeAuditItem';

type Scope = 'all' | 'mine';

export default function OvertimeActivity() {
  const currentUser = useCurrentUser();
  const [scope, setScope] = useState<Scope>('all');

  // New changes from anyone land at the top without a reload.
  useOvertimeRealtime();

  const query = useOvertimeAuditLogsQuery(
    scope === 'mine' ? { actorId: currentUser?.id } : {},
    scope === 'all' || Boolean(currentUser?.id),
  );
  const logs = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <AppPageContainer>
      <AppPageHeader
        title="Activity"
        description="Every overtime entry registered, changed or deleted — who did it, when, and what it looked like before."
      />

      <Tabs value={scope} onValueChange={(value) => setScope(value as Scope)} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">Everyone</TabsTrigger>
          <TabsTrigger value="mine">My changes</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-xl border bg-card p-4">
        {query.isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : query.isError ? (
          <p className="p-10 text-center text-sm text-destructive">Could not load the activity log.</p>
        ) : logs.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No changes recorded yet.</p>
        ) : (
          <>
            <ul className="divide-y [&>li]:py-3 [&>li:first-child]:pt-0">
              {logs.map((log) => (
                <OvertimeAuditItem key={log.id} log={log} />
              ))}
            </ul>
            {query.hasNextPage && (
              <div className="mt-2 flex justify-center border-t pt-3">
                <Button variant="outline" size="sm" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
                  {query.isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppPageContainer>
  );
}

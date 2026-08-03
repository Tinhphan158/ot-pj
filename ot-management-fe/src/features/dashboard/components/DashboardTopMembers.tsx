'use client';

import { Crown } from 'lucide-react';
import type { DashboardMemberStat } from '@/shared/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { cn } from '@/shared/utils/cn';
import { formatHours } from '@/shared/utils/format';
import { OvertimeUserAvatar } from '@/features/overtime/components/OvertimeUserAvatar';

interface DashboardTopMembersProps {
  members: DashboardMemberStat[];
  currentUserId?: string;
  /** How many rows to render before the "and N others" footer. */
  limit?: number;
}

const RANK_STYLES = ['bg-amber-400 text-amber-950', 'bg-slate-300 text-slate-800', 'bg-orange-300 text-orange-950'];

export function DashboardTopMembers({ members, currentUserId, limit = 10 }: DashboardTopMembersProps) {
  const visible = members.slice(0, limit);
  // Both bars share one scale — the largest registered total on the board — so
  // the worked bar reads as a filled portion of it rather than its own ranking.
  // Members are ordered by hours worked, so the widest total is not row one.
  const scale = members.reduce((max, member) => Math.max(max, member.totalHours), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="size-4 text-amber-500" />
          Top OT
        </CardTitle>
        <CardDescription>Ranked by OT hours already worked.</CardDescription>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm bg-primary/30" />
            Worked so far
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-sm bg-primary/10" />
            Registered for the period
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <div className="flex h-60 items-center justify-center text-sm text-muted-foreground">
            Nobody has overtime in this period.
          </div>
        ) : (
          <ol className="flex flex-col gap-1">
            {visible.map((member, index) => {
              const mine = member.userId === currentUserId;
              const totalPct = scale > 0 ? Math.max(2, Math.round((member.totalHours / scale) * 100)) : 0;
              // Floored at a sliver only once there is something to show — zero
              // hours worked must be zero width, or an all-upcoming member looks
              // like they have started.
              const workedPct =
                scale > 0 && member.hours > 0
                  ? Math.max(1, Math.round((member.hours / scale) * 100))
                  : 0;
              const upcoming = member.totalHours > member.hours;
              return (
                <li
                  key={member.userId}
                  className={cn(
                    'relative flex items-center gap-3 overflow-hidden rounded-lg px-2 py-2',
                    mine && 'bg-primary/5',
                  )}
                >
                  {/* Registered total for the period — the envelope. */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 rounded-lg bg-primary/10"
                    style={{ width: `${totalPct}%` }}
                  />
                  {/* Worked so far, filling that envelope from the left. */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 rounded-lg bg-primary/30 transition-[width] duration-500 ease-out"
                    style={{ width: `${workedPct}%` }}
                  />
                  <span
                    className={cn(
                      'relative flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                      RANK_STYLES[index] ?? 'bg-muted text-muted-foreground',
                    )}
                  >
                    {index + 1}
                  </span>
                  <OvertimeUserAvatar
                    userId={member.userId}
                    name={member.name}
                    avatarUrl={member.avatar}
                    className="relative size-8"
                  />
                  <div className="relative min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{member.name}</span>
                      {mine && (
                        <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                          You
                        </span>
                      )}
                    </div>
                    <div className='flex flex-col gap-1'>
                      <span className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </span>
                      {/* Only spell out the "of N" once the period still holds
                          overtime to come — the card is narrow. */}
                      <span className="truncate text-xs text-muted-foreground">
                        {upcoming
                          ? `${member.entries} of ${member.totalEntries} entries · ${member.days} of ${member.totalDays} days`
                          : `${member.entries} entries · ${member.days} days`}
                      </span>
                    </div>
                  </div>
                  <span className="relative shrink-0 text-right tabular-nums">
                    <span className="block text-sm font-semibold">{formatHours(member.hours)}</span>
                    {upcoming && (
                      <span className="block text-xs text-muted-foreground">
                        of {formatHours(member.totalHours)}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {members.length > visible.length && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            and {members.length - visible.length} others
          </p>
        )}
      </CardContent>
    </Card>
  );
}

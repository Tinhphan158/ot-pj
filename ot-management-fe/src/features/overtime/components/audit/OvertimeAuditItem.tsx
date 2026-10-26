'use client';

import { ArrowRight, PencilLine, Plus, Trash2, type LucideIcon } from 'lucide-react';
import type { OvertimeAuditAction, OvertimeAuditLog, OvertimeSnapshot } from '@/shared/api';
import { cn } from '@/shared/utils/cn';
import { formatDate, formatHours } from '@/shared/utils/format';
import { parseDateStr } from '@/features/overtime/utils/period';
import { OvertimeUserAvatar } from '@/features/overtime/components/OvertimeUserAvatar';

const ACTION_META: Record<OvertimeAuditAction, { verb: string; icon: LucideIcon; className: string }> = {
  CREATED: { verb: 'registered', icon: Plus, className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  UPDATED: { verb: 'changed', icon: PencilLine, className: 'bg-sky-500/15 text-sky-600 dark:text-sky-400' },
  DELETED: { verb: 'deleted', icon: Trash2, className: 'bg-destructive/15 text-destructive' },
};

const day = (snapshot: OvertimeSnapshot) => formatDate(parseDateStr(snapshot.date), 'dd/MM/yyyy');
const range = (snapshot: OvertimeSnapshot) => `${snapshot.startTime}–${snapshot.endTime}`;

/** What changed, as old → new pairs; only the parts that actually moved. */
function changes(before: OvertimeSnapshot, after: OvertimeSnapshot): { from: string; to: string }[] {
  const list: { from: string; to: string }[] = [];
  if (before.date !== after.date) list.push({ from: day(before), to: day(after) });
  if (before.startTime !== after.startTime || before.endTime !== after.endTime) {
    list.push({ from: `${range(before)} (${formatHours(before.hours)})`, to: `${range(after)} (${formatHours(after.hours)})` });
  }
  return list;
}

interface OvertimeAuditItemProps {
  log: OvertimeAuditLog;
  /** Inside one entry's history the entry is implied, so its date need not be repeated. */
  compact?: boolean;
}

export function OvertimeAuditItem({ log, compact = false }: OvertimeAuditItemProps) {
  const meta = ACTION_META[log.action];
  const Icon = meta.icon;
  const subject = log.after ?? log.before;
  const actorName = log.actor?.name ?? 'A former member';
  // Only the owner can change an entry today, but the log records both in case
  // that ever stops being true.
  const owner = subject && subject.userId !== log.actor?.id ? subject.userName : null;

  return (
    <li className="flex gap-3">
      {compact ? (
        <span className={cn('mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full', meta.className)}>
          <Icon className="size-3.5" />
        </span>
      ) : (
        <div className="relative shrink-0">
          <OvertimeUserAvatar
            userId={log.actor?.id ?? 'unknown'}
            name={actorName}
            avatarUrl={log.actor?.avatar}
            className="size-9"
          />
          <span
            className={cn(
              'absolute -right-1 -bottom-1 flex size-4.5 items-center justify-center rounded-full ring-2 ring-card',
              meta.className,
            )}
          >
            <Icon className="size-2.5" />
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1 text-sm">
        <p>
          <span className="font-medium">{actorName}</span> {meta.verb}{' '}
          {owner ? `${owner}'s overtime` : 'overtime'}
          {!compact && subject && (
            <>
              {' '}
              on <span className="font-medium">{day(subject)}</span>
            </>
          )}
        </p>

        {log.action === 'UPDATED' && log.before && log.after ? (
          <ul className="mt-0.5 space-y-0.5 text-xs text-muted-foreground">
            {changes(log.before, log.after).map((change) => (
              <li key={change.from} className="flex flex-wrap items-center gap-1 tabular-nums">
                <span className="line-through decoration-muted-foreground/50">{change.from}</span>
                <ArrowRight className="size-3" />
                <span className="text-foreground">{change.to}</span>
              </li>
            ))}
          </ul>
        ) : (
          subject && (
            <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
              {range(subject)} · {formatHours(subject.hours)}
            </p>
          )
        )}

        <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(log.createdAt, 'dd/MM/yyyy HH:mm')}</p>
      </div>
    </li>
  );
}

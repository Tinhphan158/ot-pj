'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import { Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { formatHours } from '@/shared/utils/format';
import type { Overtime } from '@/shared/api';
import { addDays, isSameDay, monthCycle, toDateStr } from '@/features/overtime/utils/period';
import { OvertimeUserAvatar } from '@/features/overtime/components/OvertimeUserAvatar';
import { holidayName, isDateLocked } from '@/features/overtime/utils/rules';
import { useOvertimeRulesQuery } from '@/features/overtime/hooks/queries/useOvertimeRulesQuery';
import { useCurrentUser } from '@/features/auth/store/auth.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface OvertimeMonthViewProps {
  overtimes: Overtime[];
  monthAnchor: Date;
  currentUserId?: string;
  /** Click on an empty cell of your own row — register overtime on that day. */
  onCreate: (date: string) => void;
  onEdit: (overtime: Overtime) => void;
  onDelete: (overtime: Overtime) => void;
}

/** The right-click menu: where it opens and the cell it belongs to. */
interface CellMenu {
  x: number;
  y: number;
  date: string;
  entries: Overtime[];
  locked: boolean;
}

interface UserRow {
  id: string;
  name: string;
  avatar: string | null;
  total: number;
  email: string;
}

export function OvertimeMonthView({
  overtimes,
  monthAnchor,
  currentUserId,
  onCreate,
  onEdit,
  onDelete,
}: OvertimeMonthViewProps) {
  const [menu, setMenu] = useState<CellMenu | null>(null);
  const currentUser = useCurrentUser();
  const { labelMonth, labelYear } = monthCycle(monthAnchor);
  const { data: rules } = useOvertimeRulesQuery();
  // Columns span the OT cycle (21st of prev month → 20th of the label month).
  const days = useMemo(() => {
    const { start, endExclusive } = monthCycle(monthAnchor);
    const arr: Date[] = [];
    for (let d = new Date(start); d < endExclusive; d = addDays(d, 1)) arr.push(d);
    return arr;
  }, [monthAnchor]);

  const { rows, cellMap, entryMap, maxHours } = useMemo(() => {
    const userMap = new Map<string, UserRow>();
    const cells = new Map<string, number>(); // `${userId}|${day}` -> hours
    const entries = new Map<string, Overtime[]>(); // same key -> that day's entries
    let max = 0;

    for (const o of overtimes) {
      if (!userMap.has(o.userId)) {
        userMap.set(o.userId, { id: o.userId, name: o.user?.name ?? '—', email: o.user?.email ?? '—', avatar: o.user?.avatar ?? null, total: 0 });
      }
      const row = userMap.get(o.userId)!;
      row.total += o.hours;

      const day = Number(o.date.slice(8, 10));
      const key = `${o.userId}|${day}`;
      const next = (cells.get(key) ?? 0) + o.hours;
      cells.set(key, next);
      entries.set(key, [...(entries.get(key) ?? []), o]);
      if (next > max) max = next;
    }

    // Only your own row is clickable, so keep it on the grid even before your first entry this month.
    if (currentUser && currentUser.id === currentUserId && !userMap.has(currentUser.id)) {
      userMap.set(currentUser.id, {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        total: 0,
      });
    }

    // Most overtime first; the "You" row is found by its highlight, not by position.
    const list = [...userMap.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    for (const list of entries.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return { rows: list, cellMap: cells, entryMap: entries, maxHours: max };
  }, [overtimes, currentUser, currentUserId]);

  const today = new Date();

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
        No overtime in {labelMonth + 1}/{labelYear}.
      </div>
    );
  }

  const openMenu = (event: MouseEvent, date: string, entries: Overtime[]) => {
    event.preventDefault();
    setMenu({ x: event.clientX, y: event.clientY, date, entries, locked: isDateLocked(date, rules) });
  };

  /** Own cells only: empty registers, one entry edits, several let you pick which. */
  const handleOwnCellClick = (event: MouseEvent, date: string, entries: Overtime[]) => {
    if (entries.length === 0) onCreate(date);
    else if (entries.length === 1) onEdit(entries[0]);
    else openMenu(event, date, entries);
  };

  const cellStyle = (hours: number) => {
    if (hours <= 0) return undefined;
    const intensity = maxHours > 0 ? hours / maxHours : 0;
    const pct = Math.round(12 + intensity * 60);
    return { backgroundColor: `color-mix(in srgb, var(--primary) ${pct}%, transparent)` };
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-40 border-b bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Employee
              </th>
              {days.map((day) => {
                const dow = day.getDay();
                const weekend = dow === 0 || dow === 6;
                const isToday = isSameDay(day, today);
                const holiday = holidayName(toDateStr(day), rules);
                return (
                  <th
                    key={day.getDate()}
                    title={holiday}
                    className={cn(
                      'w-12 border-b px-0 py-2 text-center text-[11px] font-medium',
                      holiday
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : weekend
                          ? 'text-muted-foreground/60'
                          : 'text-muted-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        isToday &&
                          'inline-flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground',
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </th>
                );
              })}
              <th className="border-b bg-card px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const mine = row.id === currentUserId;
              return (
                <tr key={row.id} className={cn(mine && 'bg-primary/5')}>
                  <td className={cn('sticky left-0 z-10 border-b px-3 py-1.5', mine ? 'bg-primary/5' : 'bg-card')}>
                    <span className="flex items-center gap-2">
                      <OvertimeUserAvatar userId={row.id} name={row.name} avatarUrl={row.avatar} className="size-6" />
                      <div className='flex flex-col'>
                        <div className='flex items-center gap-2'>
                          <span className="truncate font-medium">{row.name}</span>
                          {mine && (
                            <span className="rounded bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                              You
                            </span>
                          )}
                        </div>
                        <span className="truncate text-xs text-muted-foreground">{row.email ?? '—'}</span>
                      </div>
                    </span>
                  </td>
                  {days.map((day) => {
                    const dateStr = toDateStr(day);
                    const key = `${row.id}|${day.getDate()}`;
                    const hours = cellMap.get(key) ?? 0;
                    const entries = entryMap.get(key) ?? [];
                    const label = hours > 0 ? formatHours(hours) : '';
                    const cellClass = 'flex h-7 w-full items-center justify-center rounded text-[10px] font-medium tabular-nums';
                    return (
                      <td key={dateStr} className="border-b p-0.5 text-center">
                        {mine ? (
                          <button
                            type="button"
                            onClick={(event) => handleOwnCellClick(event, dateStr, entries)}
                            onContextMenu={(event) => openMenu(event, dateStr, entries)}
                            title={
                              hours > 0
                                ? `${dateStr} · ${formatHours(hours)} · click to edit, right-click for more`
                                : `${dateStr} · click to register overtime`
                            }
                            className={cn(cellClass, 'cursor-pointer transition-colors hover:ring-1 hover:ring-primary')}
                            style={cellStyle(hours)}
                          >
                            {label}
                          </button>
                        ) : (
                          // Someone else's day: shown for reference, not clickable.
                          <div
                            title={hours > 0 ? `${row.name} · ${dateStr} · ${formatHours(hours)}` : undefined}
                            className={cn(cellClass, 'cursor-default')}
                            style={cellStyle(hours)}
                          >
                            {label}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className={cn('border-b px-3 py-1.5 text-right font-semibold', mine ? 'bg-primary/5' : '')}>
                    {formatHours(row.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 60%, transparent)' }} />
          Darker cells mean more hours
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-rose-500/30" />
          Public holiday
        </span>
        <span>In your row: click an empty day to register, a filled one to edit · right-click for edit/delete</span>
        {rules && days.length > 0 && isDateLocked(toDateStr(days[0]), rules) && (
          <span className="font-medium">This OT month is closed — entries can no longer be changed</span>
        )}
      </div>

      {/* One menu for the whole grid, anchored to an invisible point at the cursor. */}
      <DropdownMenu open={menu !== null} onOpenChange={(open) => !open && setMenu(null)}>
        <DropdownMenuTrigger asChild>
          <span aria-hidden className="pointer-events-none fixed size-0" style={{ left: menu?.x, top: menu?.y }} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={2} className="min-w-44">
          {menu && <CellMenuItems menu={menu} onCreate={onCreate} onEdit={onEdit} onDelete={onDelete} />}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CellMenuItems({
  menu,
  onCreate,
  onEdit,
  onDelete,
}: {
  menu: CellMenu;
  onCreate: (date: string) => void;
  onEdit: (overtime: Overtime) => void;
  onDelete: (overtime: Overtime) => void;
}) {
  const canChange = !menu.locked;
  const reason = menu.locked ? 'OT month is closed' : null;

  if (menu.entries.length === 0) {
    return (
      <>
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{menu.date}</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => onCreate(menu.date)}>
          <Plus />
          Register overtime
        </DropdownMenuItem>
      </>
    );
  }

  return (
    <>
      {menu.entries.map((entry, i) => (
        <div key={entry.id}>
          {i > 0 && <DropdownMenuSeparator />}
          {/* Several entries on one day: label each so it is clear which one is being changed. */}
          {menu.entries.length > 1 && (
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {entry.startTime}–{entry.endTime}
            </DropdownMenuLabel>
          )}
          <DropdownMenuItem disabled={!canChange} onSelect={() => onEdit(entry)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" disabled={!canChange} onSelect={() => onDelete(entry)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </div>
      ))}
      {reason && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
            <Lock className="size-3" />
            {reason}
          </DropdownMenuLabel>
        </>
      )}
    </>
  );
}

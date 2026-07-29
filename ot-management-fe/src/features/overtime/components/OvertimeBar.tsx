'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@/shared/utils/cn';
import { formatHours } from '@/shared/utils/format';
import type { Overtime } from '@/shared/api';
import { timeToMinutes } from '@/features/overtime/utils/period';

/**
 * Drag granularity. Kept small on purpose: the axis usually spans an evening
 * (~5 hours) across the full row width, so a coarse step costs tens of pixels
 * and the bar reads as stuck until the pointer clears half of one.
 */
const STEP_MINUTES = 5;

/** Floor on the range itself, so a bar cannot be dragged down to one step. */
const MIN_DURATION_MINUTES = 30;

/**
 * End of day. The API rejects 24:00, so the last grid point is written back as
 * 23:59 — which is also how full-evening entries already look in the data.
 */
const DAY_END_MINUTES = 24 * 60;

export interface OvertimeBarProps {
  overtime: Overtime;
  color: string;
  isMine: boolean;
  /** First minute shown by the track this bar sits in. */
  domainStart: number;
  /** Minutes the track spans, used to convert pixels to time. */
  domainSpan: number;
  size?: 'sm' | 'md';
  onSelect?: (overtime: Overtime) => void;
  /**
   * Called when a drag settles on a new range. Return false to signal the save
   * failed so the bar snaps back to the stored times.
   */
  onResize?: (overtime: Overtime, startTime: string, endTime: string) => Promise<boolean>;
}

function minutesToTime(minutes: number): string {
  // The grid's top point maps onto the latest time the API accepts.
  if (minutes >= DAY_END_MINUTES) return '23:59';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const snap = (minutes: number) => Math.round(minutes / STEP_MINUTES) * STEP_MINUTES;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

interface DragState {
  edge: 'start' | 'end';
  originX: number;
  trackWidth: number;
  start: number;
  end: number;
  next: { start: number; end: number };
}

/**
 * One overtime entry drawn on an hour axis. Owners get a handle at each end to
 * stretch or shrink the entry; everything else is read-only.
 *
 * The handles are `aria-hidden` on purpose: dragging is a shortcut, and the same
 * edit is reachable for everyone through the drawer behind a click on the bar.
 *
 * The bar is absolutely positioned inside its track, so it reads the track's
 * pixel width off `parentElement` to turn a pointer delta into minutes.
 */
export function OvertimeBar({
  overtime,
  color,
  isMine,
  domainStart,
  domainSpan,
  size = 'md',
  onSelect,
  onResize,
}: OvertimeBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [draft, setDraft] = useState<{ start: number; end: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // New times arriving from the server mean the draft has served its purpose.
  // A failed save leaves the props untouched, so `commit` clears it explicitly.
  useEffect(() => {
    setDraft(null);
  }, [overtime.startTime, overtime.endTime]);

  const resizable = Boolean(onResize) && isMine;

  const startMinutes = draft?.start ?? timeToMinutes(overtime.startTime);
  const endMinutes = draft?.end ?? timeToMinutes(overtime.endTime);

  // Clamped to the track: a drag may run past the axis, which only spans the
  // stored entries. Letting it overflow would paint the bar outside its row
  // until the save widens the axis.
  const percent = (minutes: number) => clamp(((minutes - domainStart) / domainSpan) * 100, 0, 100);
  const left = percent(startMinutes);
  const width = Math.max(percent(endMinutes) - left, 2);

  const startLabel = minutesToTime(startMinutes);
  const endLabel = minutesToTime(endMinutes);
  // Mirror what the server will store, so the preview does not read 7h for a
  // range that is about to be saved as 17:00–23:59.
  const hours = draft ? (Math.min(endMinutes, DAY_END_MINUTES - 1) - startMinutes) / 60 : overtime.hours;

  const beginDrag = (event: ReactPointerEvent<HTMLSpanElement>, edge: 'start' | 'end') => {
    const track = barRef.current?.parentElement;
    if (!track || isSaving) return;

    // Keep the click off the bar underneath, which opens the edit drawer.
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    const start = timeToMinutes(overtime.startTime);
    const end = timeToMinutes(overtime.endTime);
    dragRef.current = {
      edge,
      originX: event.clientX,
      trackWidth: track.getBoundingClientRect().width,
      start,
      end,
      next: { start, end },
    };
    setDraft({ start, end });
  };

  const onDragMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.trackWidth === 0) return;

    const deltaMinutes = ((event.clientX - drag.originX) / drag.trackWidth) * domainSpan;

    const next =
      drag.edge === 'start'
        ? {
            start: clamp(snap(drag.start + deltaMinutes), 0, drag.end - MIN_DURATION_MINUTES),
            end: drag.end,
          }
        : {
            start: drag.start,
            end: clamp(
              snap(drag.end + deltaMinutes),
              drag.start + MIN_DURATION_MINUTES,
              DAY_END_MINUTES,
            ),
          };

    drag.next = next;
    setDraft(next);
  };

  const endDrag = async (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const { next } = drag;
    if (next.start === drag.start && next.end === drag.end) {
      setDraft(null);
      return;
    }

    setIsSaving(true);
    const saved = await onResize?.(overtime, minutesToTime(next.start), minutesToTime(next.end));
    setIsSaving(false);
    if (!saved) setDraft(null);
  };

  const handleClass = cn(
    // Wider than the grip it draws, so the edge is easy to grab on the first try.
    'absolute inset-y-0 z-10 w-3 touch-none cursor-ew-resize',
    'after:absolute after:inset-y-1 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:rounded-full',
    'after:bg-white/0 hover:after:bg-white/70',
  );

  return (
    <div
      ref={barRef}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 overflow-hidden rounded-md text-xs text-white shadow-sm',
        size === 'md' ? 'h-7' : 'h-6',
        isMine && 'ring-2 ring-foreground ring-offset-1 ring-offset-card',
        (draft || isSaving) && 'ring-2 ring-primary',
        isSaving && 'opacity-70',
      )}
      style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }}
      title={`${overtime.user?.name ?? ''} · ${startLabel}–${endLabel}`}
    >
      <button
        type="button"
        onClick={() => onSelect?.(overtime)}
        disabled={isSaving}
        className={cn(
          'flex size-full items-center justify-between gap-2 px-2 transition-[filter] hover:brightness-110',
          onSelect && 'cursor-pointer',
        )}
      >
        <span className="truncate font-medium">
          {startLabel}–{endLabel}
        </span>
        <span className="shrink-0 opacity-90">{formatHours(hours)}</span>
      </button>

      {resizable && (
        <>
          <span
            aria-hidden
            title="Drag to change the start time"
            className={cn(handleClass, 'left-0')}
            onPointerDown={(event) => beginDrag(event, 'start')}
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
          <span
            aria-hidden
            title="Drag to change the end time"
            className={cn(handleClass, 'right-0')}
            onPointerDown={(event) => beginDrag(event, 'end')}
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@/shared/utils/cn';
import { formatHours } from '@/shared/utils/format';
import type { Overtime } from '@/shared/api';
import { timeToMinutes } from '@/features/overtime/utils/period';
import { OT_WINDOW_END_MINUTES, OT_WINDOW_START_MINUTES } from '@/features/overtime/utils/timeDomain';

/**
 * Drag granularity. Kept small on purpose: the axis spans a five-hour evening
 * across the full row width, so a coarse step costs tens of pixels and the bar
 * reads as stuck until the pointer clears half of one.
 */
const STEP_MINUTES = 5;

/** Floor on the range itself, so a bar cannot be dragged down to one step. */
const MIN_DURATION_MINUTES = 30;

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
 * The range `drag` describes once its edge is moved by `offset` minutes, held
 * inside the allowed evening window. Entries stored outside it — from before the
 * rule, or seeded — keep their other edge, so a drag narrows them towards the
 * window instead of refusing to move.
 */
function offsetRange(drag: DragState, offset: number): { start: number; end: number } {
  if (drag.edge === 'start') {
    // The window bound wins over the minimum duration, so an entry shorter than
    // one duration cannot be dragged out of the window to satisfy it.
    const latest = Math.max(OT_WINDOW_START_MINUTES, drag.end - MIN_DURATION_MINUTES);
    return {
      start: clamp(snap(drag.start + offset), OT_WINDOW_START_MINUTES, latest),
      end: drag.end,
    };
  }
  const earliest = Math.min(OT_WINDOW_END_MINUTES, drag.start + MIN_DURATION_MINUTES);
  return {
    start: drag.start,
    end: clamp(snap(drag.end + offset), earliest, OT_WINDOW_END_MINUTES),
  };
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

  const storedStart = timeToMinutes(overtime.startTime);
  const storedEnd = timeToMinutes(overtime.endTime);

  // Entries stored outside the allowed window predate the rule (or came from the
  // seed). Dragging one edge could never make them legal, so they are read-only
  // here and have to be corrected in the drawer.
  const withinWindow = storedStart >= OT_WINDOW_START_MINUTES && storedEnd <= OT_WINDOW_END_MINUTES;
  const resizable = Boolean(onResize) && isMine && withinWindow;

  const startMinutes = draft?.start ?? storedStart;
  const endMinutes = draft?.end ?? storedEnd;

  // The axis is the allowed window, so anything stored outside it is clipped to
  // the border rather than painted past the end of its row.
  const percent = (minutes: number) => clamp(((minutes - domainStart) / domainSpan) * 100, 0, 100);
  const left = percent(startMinutes);
  const width = Math.max(percent(endMinutes) - left, 2);

  const startLabel = minutesToTime(startMinutes);
  const endLabel = minutesToTime(endMinutes);
  const hours = draft ? (endMinutes - startMinutes) / 60 : overtime.hours;

  const beginDrag = (event: ReactPointerEvent<HTMLSpanElement>, edge: 'start' | 'end') => {
    const track = barRef.current?.parentElement;
    if (!track || isSaving) return;

    // Keep the click off the bar underneath, which opens the edit drawer.
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      edge,
      originX: event.clientX,
      trackWidth: track.getBoundingClientRect().width,
      start: storedStart,
      end: storedEnd,
      next: { start: storedStart, end: storedEnd },
    };
    setDraft({ start: storedStart, end: storedEnd });
  };

  const onDragMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.trackWidth === 0) return;

    const offset = ((event.clientX - drag.originX) / drag.trackWidth) * domainSpan;
    const next = offsetRange(drag, offset);
    if (next.start === drag.next.start && next.end === drag.next.end) return;

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

    // The draft is held through the save so the bar stays where it was dropped
    // instead of bouncing back for the round trip.
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

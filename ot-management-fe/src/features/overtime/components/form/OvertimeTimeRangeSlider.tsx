'use client';

import { useController, type Control } from 'react-hook-form';
import { Slider } from '@/shared/components/ui/slider';
import { formatHours } from '@/shared/utils/format';
import type { OvertimeWindow } from '@/shared/api';
import type { OvertimeFormValues } from '@/features/overtime/schemas/overtime.schema';
import { timeToMinutes } from '@/features/overtime/utils/period';

/** Same 5-minute grain as dragging a bar in the Day/Week views. */
const STEP_MINUTES = 5;
/** The slider stops at 21:00; a later end can still be typed into the field. */
const SLIDER_MAX_MINUTES = 21 * 60;

function minutesToTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

interface OvertimeTimeRangeSliderProps {
  control: Control<OvertimeFormValues>;
  /** The day's allowed window — the slider never offers a time outside it. */
  window: OvertimeWindow;
  disabled?: boolean;
}

/**
 * Drag the two handles instead of typing: writes straight into the start/end
 * time fields, so the inputs and the slider always show the same range.
 */
export function OvertimeTimeRangeSlider({ control, window, disabled }: OvertimeTimeRangeSliderProps) {
  const { field: start } = useController({ control, name: 'startTime' });
  const { field: end } = useController({ control, name: 'endTime' });

  const min = timeToMinutes(window.start);
  const max = Math.min(timeToMinutes(window.end), SLIDER_MAX_MINUTES);
  const clamp = (value: number) => Math.min(max, Math.max(min, value));

  // Half-typed or out-of-window values are pinned to the edges for display only.
  const startMinutes = start.value ? clamp(timeToMinutes(start.value)) : min;
  const endMinutes = end.value ? clamp(timeToMinutes(end.value)) : max;
  const value = [Math.min(startMinutes, endMinutes), Math.max(startMinutes, endMinutes)];

  // An hour mark every hour on short windows, every two on the long day-off one.
  const tickEvery = max - min > 6 * 60 ? 120 : 60;
  const ticks: number[] = [];
  for (let t = Math.ceil(min / tickEvery) * tickEvery; t <= max; t += tickEvery) ticks.push(t);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Drag to adjust</span>
        <span className="font-medium tabular-nums">
          {minutesToTime(value[0])} – {minutesToTime(value[1])} · {formatHours((value[1] - value[0]) / 60)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={STEP_MINUTES}
        minStepsBetweenThumbs={1}
        value={value}
        disabled={disabled}
        onValueChange={([from, to]) => {
          start.onChange(minutesToTime(from));
          end.onChange(minutesToTime(to));
        }}
        aria-label="Overtime time range"
        className="py-1"
      />
      <div className="relative h-4 text-[10px] text-muted-foreground tabular-nums">
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
            style={{ left: `${((t - min) / (max - min)) * 100}%` }}
          >
            {minutesToTime(t)}
          </span>
        ))}
      </div>
    </div>
  );
}

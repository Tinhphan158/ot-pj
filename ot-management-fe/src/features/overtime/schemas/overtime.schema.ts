import { z } from 'zod';
import type { OvertimeWindow } from '@/shared/api';
import { timeToMinutes } from '@/features/overtime/utils/period';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const baseSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().regex(TIME_REGEX, 'Use HH:mm format'),
  endTime: z.string().regex(TIME_REGEX, 'Use HH:mm format'),
});

export type OvertimeFormValues = z.infer<typeof baseSchema>;

/**
 * The form's schema. The allowed hours depend on the chosen day — a weekday
 * evening or a whole day off — so the caller supplies the lookup.
 */
export function createOvertimeSchema(windowFor: (date: string) => OvertimeWindow) {
  return baseSchema.superRefine((values, ctx) => {
    // Only worth checking once both fields parse; the regex reports the rest.
    if (!TIME_REGEX.test(values.startTime) || !TIME_REGEX.test(values.endTime)) return;

    const start = timeToMinutes(values.startTime);
    const end = timeToMinutes(values.endTime);

    if (values.date) {
      const window = windowFor(values.date);
      const windowStart = timeToMinutes(window.start);
      const windowEnd = timeToMinutes(window.end);
      const hint = `Overtime on this day must fall between ${window.start} and ${window.end}`;

      if (start < windowStart || start > windowEnd) {
        ctx.addIssue({ code: 'custom', path: ['startTime'], message: hint });
      }
      if (end < windowStart || end > windowEnd) {
        ctx.addIssue({ code: 'custom', path: ['endTime'], message: hint });
      }
    }
    if (end <= start) {
      ctx.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'End time must be after the start time',
      });
    }
  });
}

export const OVERTIME_EMPTY: OvertimeFormValues = {
  date: '',
  startTime: '17:00',
  endTime: '19:00',
};

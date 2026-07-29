import { z } from 'zod';
import {
  OT_WINDOW_END_MINUTES,
  OT_WINDOW_END_TIME,
  OT_WINDOW_START_MINUTES,
  OT_WINDOW_START_TIME,
} from '@/features/overtime/utils/timeDomain';
import { timeToMinutes } from '@/features/overtime/utils/period';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const WINDOW_HINT = `Overtime must fall between ${OT_WINDOW_START_TIME} and ${OT_WINDOW_END_TIME}`;

export const overtimeSchema = z
  .object({
    date: z.string().min(1, 'Date is required'),
    startTime: z.string().regex(TIME_REGEX, 'Use HH:mm format'),
    endTime: z.string().regex(TIME_REGEX, 'Use HH:mm format'),
  })
  .superRefine((values, ctx) => {
    // Only worth checking once both fields parse; the regex reports the rest.
    if (!TIME_REGEX.test(values.startTime) || !TIME_REGEX.test(values.endTime)) return;

    const start = timeToMinutes(values.startTime);
    const end = timeToMinutes(values.endTime);

    if (start < OT_WINDOW_START_MINUTES || start > OT_WINDOW_END_MINUTES) {
      ctx.addIssue({ code: 'custom', path: ['startTime'], message: WINDOW_HINT });
    }
    if (end < OT_WINDOW_START_MINUTES || end > OT_WINDOW_END_MINUTES) {
      ctx.addIssue({ code: 'custom', path: ['endTime'], message: WINDOW_HINT });
    }
    if (end <= start) {
      ctx.addIssue({
        code: 'custom',
        path: ['endTime'],
        message: 'End time must be after the start time',
      });
    }
  });

export type OvertimeFormValues = z.infer<typeof overtimeSchema>;

export const OVERTIME_EMPTY: OvertimeFormValues = {
  date: '',
  startTime: '17:00',
  endTime: '19:00',
};

import { z } from 'zod';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const overtimeSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().regex(TIME_REGEX, 'Use HH:mm format'),
  endTime: z.string().regex(TIME_REGEX, 'Use HH:mm format'),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(500),
});

export type OvertimeFormValues = z.infer<typeof overtimeSchema>;

export const OVERTIME_EMPTY: OvertimeFormValues = {
  date: '',
  startTime: '17:00',
  endTime: '19:00',
  reason: '',
};

'use client';

import { useWatch, type Control } from 'react-hook-form';
import { CalendarHeart, Lock } from 'lucide-react';
import type { OvertimeRules } from '@/shared/api';
import { AppFieldGroup, AppFormDatePicker, AppFormTimeField } from '@/shared/components/custome';
import { formatDate } from '@/shared/utils/format';
import type { OvertimeFormValues } from '@/features/overtime/schemas/overtime.schema';
import { DAY_TYPE_LABEL, dayTypeOf, holidayName, isDateLocked, lockDateOf, windowFor } from '@/features/overtime/utils/rules';

interface OvertimeFormProps {
  control: Control<OvertimeFormValues>;
  rules?: OvertimeRules;
}

export function OvertimeForm({ control, rules }: OvertimeFormProps) {
  const date = useWatch({ control, name: 'date' });
  const allowed = windowFor(date, rules);
  const dayType = date ? dayTypeOf(date, rules) : null;
  const holiday = date ? holidayName(date, rules) : undefined;
  const locked = rules && date ? isDateLocked(date, rules) : false;

  return (
    <div className="space-y-4">
      <AppFormDatePicker control={control} name="date" label="Date" />
      <AppFieldGroup>
        <AppFormTimeField control={control} name="startTime" label="Start time" />
        <AppFormTimeField control={control} name="endTime" label="End time" />
      </AppFieldGroup>

      {locked && rules ? (
        <p className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <Lock className="mt-0.5 size-3.5 shrink-0" />
          This OT month was closed on {formatDate(lockDateOf(date, rules))} and can no longer be changed.
        </p>
      ) : (
        <div className="space-y-1 text-xs text-muted-foreground">
          {dayType && rules && (
            <p className="flex items-center gap-1.5">
              {holiday && <CalendarHeart className="size-3.5 text-rose-500" />}
              <span className="font-medium text-foreground">{holiday ?? DAY_TYPE_LABEL[dayType]}</span>
              <span>· paid at {rules.multipliers[dayType] * 100}%</span>
            </p>
          )}
          <p>
            Overtime on this day can be registered between {allowed.start} and {allowed.end}.
          </p>
        </div>
      )}
    </div>
  );
}

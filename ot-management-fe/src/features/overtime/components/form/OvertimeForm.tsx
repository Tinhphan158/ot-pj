'use client';

import type { Control } from 'react-hook-form';
import { AppFieldGroup, AppFormDatePicker, AppFormTimeField } from '@/shared/components/custome';
import type { OvertimeFormValues } from '@/features/overtime/schemas/overtime.schema';
import { OT_WINDOW_END_TIME, OT_WINDOW_START_TIME } from '@/features/overtime/utils/timeDomain';

export function OvertimeForm({ control }: { control: Control<OvertimeFormValues> }) {
  return (
    <div className="space-y-4">
      <AppFormDatePicker control={control} name="date" label="Date" />
      <AppFieldGroup>
        <AppFormTimeField control={control} name="startTime" label="Start time" />
        <AppFormTimeField control={control} name="endTime" label="End time" />
      </AppFieldGroup>
      <p className="text-xs text-muted-foreground">
        Overtime can only be registered between {OT_WINDOW_START_TIME} and {OT_WINDOW_END_TIME}.
      </p>
    </div>
  );
}

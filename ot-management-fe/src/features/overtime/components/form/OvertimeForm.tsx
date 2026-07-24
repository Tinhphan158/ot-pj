'use client';

import type { Control } from 'react-hook-form';
import { AppFieldGroup, AppFormDatePicker, AppFormTimeField } from '@/shared/components/custome';
import type { OvertimeFormValues } from '@/features/overtime/schemas/overtime.schema';

export function OvertimeForm({ control }: { control: Control<OvertimeFormValues> }) {
  return (
    <div className="space-y-4">
      <AppFormDatePicker control={control} name="date" label="Date" />
      <AppFieldGroup>
        <AppFormTimeField control={control} name="startTime" label="Start time" />
        <AppFormTimeField control={control} name="endTime" label="End time" />
      </AppFieldGroup>
    </div>
  );
}

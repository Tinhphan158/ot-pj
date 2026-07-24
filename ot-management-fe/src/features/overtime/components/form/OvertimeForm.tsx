'use client';

import type { Control } from 'react-hook-form';
import { AppFieldGroup, AppFormInput, AppFormTextarea } from '@/shared/components/custome';
import type { OvertimeFormValues } from '@/features/overtime/schemas/overtime.schema';

export function OvertimeForm({ control }: { control: Control<OvertimeFormValues> }) {
  return (
    <div className="space-y-4">
      <AppFormInput control={control} name="date" label="Date" type="date" />
      <AppFieldGroup>
        <AppFormInput control={control} name="startTime" label="Start time" type="time" />
        <AppFormInput control={control} name="endTime" label="End time" type="time" />
      </AppFieldGroup>
      <AppFormTextarea
        control={control}
        name="reason"
        label="Reason"
        placeholder="Describe why the overtime was needed…"
        rows={4}
      />
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import type { Overtime } from '@/shared/api';
import { OVERTIME_EMPTY, overtimeSchema, type OvertimeFormValues } from '@/features/overtime/schemas/overtime.schema';
import { OvertimeForm } from '../form/OvertimeForm';

interface OvertimeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Overtime | null;
  defaultDate?: string;
  isSubmitting: boolean;
  onSubmit: (values: OvertimeFormValues) => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

function toFormValues(overtime: Overtime | null, defaultDate?: string): OvertimeFormValues {
  if (!overtime) return { ...OVERTIME_EMPTY, date: defaultDate ?? '' };
  return {
    date: overtime.date,
    startTime: overtime.startTime,
    endTime: overtime.endTime,
  };
}

export function OvertimeDrawer({
  open,
  onOpenChange,
  editing,
  defaultDate,
  isSubmitting,
  onSubmit,
  onDelete,
  isDeleting,
}: OvertimeDrawerProps) {
  const form = useForm<OvertimeFormValues>({
    resolver: zodResolver(overtimeSchema),
    defaultValues: OVERTIME_EMPTY,
    mode: 'onChange',
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(editing, defaultDate));
  }, [open, editing, defaultDate, form]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? 'Edit overtime' : 'Register overtime'}</SheetTitle>
          <SheetDescription>
            {editing ? 'Update the details of this overtime entry.' : 'Log a new overtime entry.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-4">
              <OvertimeForm control={form.control} />
            </div>
            <SheetFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {editing ? 'Save changes' : 'Register overtime'}
              </Button>
              {editing && onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={onDelete}
                  disabled={isDeleting || isSubmitting}
                >
                  {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Delete
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

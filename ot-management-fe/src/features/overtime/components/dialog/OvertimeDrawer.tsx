'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { History, Loader2, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Form } from '@/shared/components/ui/form';
import { Button } from '@/shared/components/ui/button';
import type { Overtime } from '@/shared/api';
import { OVERTIME_EMPTY, createOvertimeSchema, type OvertimeFormValues } from '@/features/overtime/schemas/overtime.schema';
import { useOvertimeRulesQuery } from '@/features/overtime/hooks/queries/useOvertimeRulesQuery';
import { useOvertimeAuditLogsQuery } from '@/features/overtime/hooks/queries/useOvertimeAuditLogsQuery';
import { isDateLocked, windowFor } from '@/features/overtime/utils/rules';
import { OvertimeAuditItem } from '../audit/OvertimeAuditItem';
import { OvertimeForm } from '../form/OvertimeForm';
import { OvertimeUsagePanel } from '../form/OvertimeUsagePanel';

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

function OvertimeHistory({ overtimeId }: { overtimeId: string }) {
  const query = useOvertimeAuditLogsQuery({ overtimeId });
  const logs = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="space-y-2 border-t pt-4">
      <h3 className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <History className="size-3.5" />
        History
      </h3>
      {query.isLoading ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      ) : logs.length === 0 ? (
        // Entries registered before the log existed have no history.
        <p className="text-xs text-muted-foreground">No recorded changes.</p>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <OvertimeAuditItem key={log.id} log={log} compact />
          ))}
        </ul>
      )}
    </section>
  );
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
  const { data: rules } = useOvertimeRulesQuery();
  // Read through a ref so the schema — and the resolver the form was created
  // with — sees the rules once they arrive without being rebuilt.
  const rulesRef = useRef(rules);
  useEffect(() => {
    rulesRef.current = rules;
  }, [rules]);
  const schema = useMemo(() => createOvertimeSchema((date) => windowFor(date, rulesRef.current)), []);

  const form = useForm<OvertimeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: OVERTIME_EMPTY,
    mode: 'onChange',
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(editing, defaultDate));
  }, [open, editing, defaultDate, form]);

  const date = useWatch({ control: form.control, name: 'date' });

  // A closed month cannot be left (the stored date) or entered (the chosen one).
  const locked = (editing ? isDateLocked(editing.date, rules) : false) || isDateLocked(date, rules);

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
            <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
              <OvertimeForm control={form.control} rules={rules} />
              {!locked && (
                <OvertimeUsagePanel date={date} />
              )}
              {editing && open && <OvertimeHistory overtimeId={editing.id} />}
            </div>
            <SheetFooter>
              <Button type="submit" disabled={isSubmitting || locked}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {editing ? 'Save changes' : 'Register overtime'}
              </Button>
              {editing && onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={onDelete}
                  disabled={isDeleting || isSubmitting || isDateLocked(editing.date, rules)}
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

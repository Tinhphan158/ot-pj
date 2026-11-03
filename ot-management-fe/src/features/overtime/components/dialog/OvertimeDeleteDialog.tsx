'use client';

import { Loader2, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { formatDateWithWeekday, formatHours } from '@/shared/utils/format';
import type { Overtime } from '@/shared/api';

interface OvertimeDeleteDialogProps {
  /** The entry about to be deleted, or null when nothing needs confirming. */
  overtime: Overtime | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

/** Confirmation for deleting straight from a calendar cell, where there is no drawer to review the entry first. */
export function OvertimeDeleteDialog({ overtime, onOpenChange, onConfirm, isDeleting }: OvertimeDeleteDialogProps) {
  return (
    <AlertDialog open={overtime !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <Trash2 className="size-4.5" />
            </span>
            Delete this overtime?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {overtime && (
              <>
                <span className="font-medium text-foreground">{formatDateWithWeekday(overtime.date)}</span>,{' '}
                <span className="font-medium text-foreground">
                  {overtime.startTime}–{overtime.endTime}
                </span>{' '}
                ({formatHours(overtime.hours)}). This cannot be undone.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              // Keep the dialog mounted until the mutation settles.
              event.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

'use client';

import { Loader2, Users } from 'lucide-react';
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
import { formatDateWithWeekday } from '@/shared/utils/format';

interface OvertimeCrowdedDayDialogProps {
  /** The day being registered on, or null when nothing needs confirming. */
  day: { date: string; count: number } | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

/**
 * Soft guard shown when a day already has a lot of overtime registered. This is
 * a nudge, not a rule — the server accepts the entry either way.
 */
export function OvertimeCrowdedDayDialog({
  day,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: OvertimeCrowdedDayDialogProps) {
  return (
    <AlertDialog open={day !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
              <Users className="size-4.5" />
            </span>
            Ngày này đã khá đông
          </AlertDialogTitle>
          <AlertDialogDescription>
            {day && (
              <>
                <span className="font-medium text-foreground">{formatDateWithWeekday(day.date)}</span> hiện đã có{' '}
                <span className="font-medium text-foreground">{day.count} đơn OT</span>. Nếu tạo thêm thì sẽ quá đông.
                Bạn có chắc chắn muốn tạo thêm không?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Không</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              // Keep the dialog mounted until the mutation settles.
              event.preventDefault();
              onConfirm();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Có, vẫn tạo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

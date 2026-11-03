'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { overtimeKeys, overtimeService, type Overtime } from '@/shared/api';
import { notify } from '@/shared/utils/notify';
import { getErrorMessage } from '@/shared/utils/api-error';
import { useCurrentUser } from '@/features/auth/store/auth.store';
import { addDays, parseDateStr, toDateStr } from '@/features/overtime/utils/period';
import type { OvertimeFormValues } from '@/features/overtime/schemas/overtime.schema';
import { useCreateOvertimeMutation } from './mutations/useCreateOvertimeMutation';
import { useUpdateOvertimeMutation } from './mutations/useUpdateOvertimeMutation';
import { useDeleteOvertimeMutation } from './mutations/useDeleteOvertimeMutation';

/**
 * Registering on a day that already has this many entries asks for confirmation
 * first. It is a nudge only — nothing on the server rejects a busy day.
 */
const CROWDED_DAY_THRESHOLD = 5;

export function useOvertimeActions() {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Overtime | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);
  // Set while a confirmation is pending; holds the values waiting to be sent.
  const [crowdedDay, setCrowdedDay] = useState<{ date: string; count: number; values: OvertimeFormValues } | null>(
    null,
  );
  const [isCheckingDay, setIsCheckingDay] = useState(false);

  const createMutation = useCreateOvertimeMutation();
  const updateMutation = useUpdateOvertimeMutation();
  const deleteMutation = useDeleteOvertimeMutation();

  const openCreate = (date?: string) => {
    setEditing(null);
    setDefaultDate(date);
    setDrawerOpen(true);
  };

  const openEdit = (overtime: Overtime) => {
    // Only the owner may edit/delete their own OT.
    if (overtime.userId !== currentUser?.id) {
      notify({ type: 'info', title: 'Only the owner can edit this', description: 'This overtime entry belongs to someone else.' });
      return;
    }
    setEditing(overtime);
    setDrawerOpen(true);
  };

  /**
   * Save a new range produced by dragging a bar's edge. Returns whether it
   * stuck, so the bar knows to keep the dragged position or snap back.
   */
  const resizeOvertime = async (overtime: Overtime, startTime: string, endTime: string): Promise<boolean> => {
    if (overtime.userId !== currentUser?.id) {
      notify({ type: 'info', title: 'Only the owner can edit this', description: 'This overtime entry belongs to someone else.' });
      return false;
    }

    try {
      // The range is the only thing a drag touches, so leave the date alone.
      await updateMutation.mutateAsync({ id: overtime.id, payload: { startTime, endTime } });
      notify({ type: 'success', title: 'Overtime updated', description: `${startTime}–${endTime}` });
      return true;
    } catch (error) {
      notify({ type: 'error', title: 'Could not save overtime', description: getErrorMessage(error) });
      return false;
    }
  };

  /**
   * Move a day's entries to another day, keeping their hours (drag & drop in the
   * month grid). Sent one by one and stops at the first rejection; the server
   * re-checks ownership, closed months, the day's window, overlaps and limits.
   */
  const moveOvertimes = async (overtimes: Overtime[], date: string): Promise<boolean> => {
    if (overtimes.some((o) => o.userId !== currentUser?.id)) {
      notify({ type: 'info', title: 'Only the owner can move this', description: 'This overtime entry belongs to someone else.' });
      return false;
    }

    let moved = 0;
    try {
      for (const overtime of overtimes) {
        await updateMutation.mutateAsync({ id: overtime.id, payload: { date } });
        moved++;
      }
      notify({
        type: 'success',
        title: 'Overtime moved',
        description: `${overtimes.length > 1 ? `${overtimes.length} entries` : `${overtimes[0].startTime}–${overtimes[0].endTime}`} → ${date}`,
      });
      return true;
    } catch (error) {
      notify({
        type: 'error',
        title: moved > 0 ? `Moved ${moved} of ${overtimes.length} entries` : 'Could not move overtime',
        description: getErrorMessage(error),
      });
      return false;
    }
  };

  const handleDrawerOpenChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) setEditing(null);
  };

  /**
   * Company-wide number of entries already registered on `date`. Uses the same
   * cache key as the Day view, so it is usually free.
   */
  const countEntriesOnDay = async (date: string): Promise<number> => {
    const to = toDateStr(addDays(parseDateStr(date), 1));
    const items = await queryClient.fetchQuery({
      queryKey: overtimeKeys.range(date, to),
      queryFn: () => overtimeService.findByRange(date, to),
    });
    return items.length;
  };

  const createOvertime = async (values: OvertimeFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      notify({ type: 'success', title: 'Overtime registered' });
      setCrowdedDay(null);
      handleDrawerOpenChange(false);
    } catch (error) {
      // Drop back to the drawer so the user can fix whatever the server rejected.
      setCrowdedDay(null);
      notify({ type: 'error', title: 'Could not save overtime', description: getErrorMessage(error) });
    }
  };

  const handleSubmit = async (values: OvertimeFormValues) => {
    if (editing) {
      try {
        await updateMutation.mutateAsync({ id: editing.id, payload: values });
        notify({ type: 'success', title: 'Overtime updated' });
        handleDrawerOpenChange(false);
      } catch (error) {
        notify({ type: 'error', title: 'Could not save overtime', description: getErrorMessage(error) });
      }
      return;
    }

    setIsCheckingDay(true);
    try {
      const count = await countEntriesOnDay(values.date);
      if (count >= CROWDED_DAY_THRESHOLD) {
        setCrowdedDay({ date: values.date, count, values });
        return;
      }
    } catch {
      // The check is advisory; a failed lookup must not block registration.
    } finally {
      setIsCheckingDay(false);
    }

    await createOvertime(values);
  };

  const handleCrowdedDayConfirm = async () => {
    if (!crowdedDay) return;
    await createOvertime(crowdedDay.values);
  };

  const handleCrowdedDayOpenChange = (open: boolean) => {
    if (!open) setCrowdedDay(null);
  };

  /** Delete without going through the drawer. Resolves to whether it went through. */
  const deleteOvertime = async (overtime: Overtime): Promise<boolean> => {
    if (overtime.userId !== currentUser?.id) {
      notify({ type: 'info', title: 'Only the owner can delete this', description: 'This overtime entry belongs to someone else.' });
      return false;
    }
    try {
      await deleteMutation.mutateAsync(overtime.id);
      notify({ type: 'success', title: 'Overtime deleted' });
      return true;
    } catch (error) {
      notify({ type: 'error', title: 'Could not delete overtime', description: getErrorMessage(error) });
      return false;
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    if (await deleteOvertime(editing)) handleDrawerOpenChange(false);
  };

  return {
    drawerOpen,
    editing,
    defaultDate,
    crowdedDay,
    openCreate,
    openEdit,
    resizeOvertime,
    handleDrawerOpenChange,
    handleSubmit,
    handleCrowdedDayConfirm,
    handleCrowdedDayOpenChange,
    handleDelete,
    deleteOvertime,
    moveOvertimes,
    isSubmitting: createMutation.isPending || updateMutation.isPending || isCheckingDay,
    isDeleting: deleteMutation.isPending,
  };
}

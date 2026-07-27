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
      notify({ type: 'info', title: 'Chỉ chủ đơn mới sửa được', description: 'Đây là đơn OT của người khác.' });
      return;
    }
    setEditing(overtime);
    setDrawerOpen(true);
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

  const handleDelete = async () => {
    if (!editing) return;
    try {
      await deleteMutation.mutateAsync(editing.id);
      notify({ type: 'success', title: 'Overtime deleted' });
      handleDrawerOpenChange(false);
    } catch (error) {
      notify({ type: 'error', title: 'Could not delete overtime', description: getErrorMessage(error) });
    }
  };

  return {
    drawerOpen,
    editing,
    defaultDate,
    crowdedDay,
    openCreate,
    openEdit,
    handleDrawerOpenChange,
    handleSubmit,
    handleCrowdedDayConfirm,
    handleCrowdedDayOpenChange,
    handleDelete,
    isSubmitting: createMutation.isPending || updateMutation.isPending || isCheckingDay,
    isDeleting: deleteMutation.isPending,
  };
}

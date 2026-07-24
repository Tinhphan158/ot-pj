'use client';

import { useState } from 'react';
import type { Overtime } from '@/shared/api';
import { notify } from '@/shared/utils/notify';
import { getErrorMessage } from '@/shared/utils/api-error';
import type { OvertimeFormValues } from '@/features/overtime/schemas/overtime.schema';
import { useCreateOvertimeMutation } from './mutations/useCreateOvertimeMutation';
import { useUpdateOvertimeMutation } from './mutations/useUpdateOvertimeMutation';
import { useDeleteOvertimeMutation } from './mutations/useDeleteOvertimeMutation';

export function useOvertimeActions() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Overtime | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined);

  const createMutation = useCreateOvertimeMutation();
  const updateMutation = useUpdateOvertimeMutation();
  const deleteMutation = useDeleteOvertimeMutation();

  const openCreate = (date?: string) => {
    setEditing(null);
    setDefaultDate(date);
    setDrawerOpen(true);
  };

  const openEdit = (overtime: Overtime) => {
    setEditing(overtime);
    setDrawerOpen(true);
  };

  const handleDrawerOpenChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) setEditing(null);
  };

  const handleSubmit = async (values: OvertimeFormValues) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: values });
        notify({ type: 'success', title: 'Overtime updated' });
      } else {
        await createMutation.mutateAsync(values);
        notify({ type: 'success', title: 'Overtime registered' });
      }
      handleDrawerOpenChange(false);
    } catch (error) {
      notify({ type: 'error', title: 'Could not save overtime', description: getErrorMessage(error) });
    }
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
    openCreate,
    openEdit,
    handleDrawerOpenChange,
    handleSubmit,
    handleDelete,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

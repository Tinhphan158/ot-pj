'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys, overtimeKeys, overtimeService, type CreateOvertimePayload } from '@/shared/api';

export function useCreateOvertimeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOvertimePayload) => overtimeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all, refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all, refetchType: 'all' });
    },
  });
}

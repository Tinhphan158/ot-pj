'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys, overtimeKeys, overtimeService } from '@/shared/api';

export function useDeleteOvertimeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => overtimeService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all, refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all, refetchType: 'all' });
    },
  });
}

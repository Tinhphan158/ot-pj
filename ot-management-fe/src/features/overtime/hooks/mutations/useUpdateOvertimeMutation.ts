'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { overtimeKeys, overtimeService, type UpdateOvertimePayload } from '@/shared/api';

export function useUpdateOvertimeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOvertimePayload }) =>
      overtimeService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all, refetchType: 'all' });
    },
  });
}

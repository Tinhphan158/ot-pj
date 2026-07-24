'use client';

import { useMutation } from '@tanstack/react-query';
import { userService, type ChangePasswordPayload } from '@/shared/api';

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => userService.changePassword(payload),
  });
}

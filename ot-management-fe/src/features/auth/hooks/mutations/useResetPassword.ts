'use client';

import { useMutation } from '@tanstack/react-query';
import { authService, type ResetPasswordPayload } from '@/shared/api';

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
  });
}

'use client';

import { useMutation } from '@tanstack/react-query';
import { authService, type ForgotPasswordPayload } from '@/shared/api';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
  });
}

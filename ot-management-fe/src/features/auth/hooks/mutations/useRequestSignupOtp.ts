'use client';

import { useMutation } from '@tanstack/react-query';
import { authService, type RequestSignupOtpPayload } from '@/shared/api';

export function useRequestSignupOtp() {
  return useMutation({
    mutationFn: (payload: RequestSignupOtpPayload) => authService.requestSignupOtp(payload),
  });
}

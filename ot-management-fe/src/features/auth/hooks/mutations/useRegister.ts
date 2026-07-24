'use client';

import { useMutation } from '@tanstack/react-query';
import { authService, type SignupPayload } from '@/shared/api';

export function useRegister() {
  // Create the account only — do NOT log the user in; they sign in afterwards.
  return useMutation({
    mutationFn: (payload: SignupPayload) => authService.signup(payload),
  });
}

'use client';

import { useMutation } from '@tanstack/react-query';
import { authService, type SignupPayload } from '@/shared/api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: SignupPayload) => authService.signup(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });
}

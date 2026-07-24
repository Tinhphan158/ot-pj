'use client';

import { useMutation } from '@tanstack/react-query';
import { authService, type LoginPayload } from '@/shared/api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
    },
  });
}

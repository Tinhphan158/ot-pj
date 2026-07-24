'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/shared/api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const mutation = useMutation({
    mutationFn: () => authService.logout(),
  });

  const logout = async () => {
    try {
      await mutation.mutateAsync();
    } catch {
      // Ignore network/expiry errors — we clear the session locally regardless.
    } finally {
      clearAuth();
      queryClient.clear();
      router.replace('/login');
    }
  };

  return { logout, isLoading: mutation.isPending };
}

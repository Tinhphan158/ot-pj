'use client';

import { useMutation } from '@tanstack/react-query';
import { userService, type UpdateProfilePayload } from '@/shared/api';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateProfile(payload),
    onSuccess: (user) => {
      // Keep the header/menu in sync with the new name/avatar.
      setUser(user);
    },
  });
}
